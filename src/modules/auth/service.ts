import { Role, UserStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { appBaseUrl, sendEmail } from "@/lib/email";
import { hashPassword, verifyPassword } from "./password";
import { consumeRateLimit } from "./rate-limit";
import type { z } from "zod";
import type { registerSchema } from "./schemas";
import { consumeToken, issueToken } from "./tokens";

export type RegisterInput = z.infer<typeof registerSchema>;

function normalizeEmail(email: string | undefined | null): string | null {
  const v = email?.trim().toLowerCase();
  return v ? v : null;
}

function normalizePhone(phone: string | undefined | null): string | null {
  const v = phone?.trim();
  return v ? v : null;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

const GENERIC_OK =
  "If an account exists for those details, you will receive further instructions shortly.";

export async function registerUser(
  input: RegisterInput,
  ip: string,
): Promise<{ ok: true } | { ok: false; code: string; message: string }> {
  const rl = await consumeRateLimit({
    bucket: `register:ip:${ip}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!rl.ok) {
    return { ok: false, code: "RATE_LIMITED", message: "Too many attempts. Try again later." };
  }

  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);
  if (!email && !phone) {
    return {
      ok: false,
      code: "VALIDATION",
      message: "Provide an email or a mobile number",
    };
  }

  if (email) {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      // Avoid account enumeration — same generic response as success path for duplicates
      return { ok: true };
    }
  }
  if (phone) {
    const exists = await prisma.user.findUnique({ where: { phone } });
    if (exists) return { ok: true };
  }

  const passwordHash = await hashPassword(input.password);
  const role = input.accountType === "dealer" ? Role.DEALER : Role.INDIVIDUAL;
  // Phone-only (OTP deferred): activate immediately. Email accounts need verification.
  const status = email ? UserStatus.PENDING_VERIFICATION : UserStatus.ACTIVE;

  const businessName = input.businessName?.trim();
  const baseSlug = slugify(businessName || input.displayName);
  const slug = `${baseSlug || "dealer"}-${Date.now().toString(36)}`;

  const user = await prisma.user.create({
    data: {
      email,
      phone,
      passwordHash,
      role,
      status,
      profile: {
        create: {
          displayName: input.displayName.trim(),
          whatsappNumber: phone,
          preferredLocale: "en",
        },
      },
      dealerProfile:
        role === Role.DEALER
          ? {
              create: {
                businessName: businessName!,
                slug,
                businessPhone: phone ?? "+971000000000",
                businessEmail: email,
                whatsappNumber: phone,
              },
            }
          : undefined,
    },
  });

  if (email) {
    const raw = await issueToken({
      identifier: email,
      purpose: "EMAIL_VERIFICATION",
      ttlMs: 24 * 60 * 60 * 1000,
    });
    const link = `${appBaseUrl()}/en/auth/verify-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(raw)}`;
    await sendEmail({
      to: email,
      subject: "Verify your Bumayed account",
      text: `Welcome to Bumayed.\n\nVerify your email:\n${link}\n\nThis link expires in 24 hours.`,
    });
  }

  void user;
  return { ok: true };
}

/** Look up by email or phone. Never reveal which field matched to the client. */
export async function authenticateCredentials(input: {
  identifier: string;
  password: string;
  ip: string;
}): Promise<
  | {
      ok: true;
      user: {
        id: string;
        email: string | null;
        phone: string | null;
        role: Role;
        status: UserStatus;
        name: string;
      };
    }
  | { ok: false; code: string }
> {
  const rl = await consumeRateLimit({
    bucket: `login:ip:${input.ip}`,
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (!rl.ok) return { ok: false, code: "RATE_LIMITED" };

  const identifier = input.identifier.trim();
  const email = identifier.includes("@")
    ? normalizeEmail(identifier)
    : null;
  const phone = identifier.startsWith("+")
    ? normalizePhone(identifier)
    : null;

  const user = await prisma.user.findFirst({
    where: email
      ? { email }
      : phone
        ? { phone }
        : {
            OR: [
              { email: normalizeEmail(identifier) ?? undefined },
              { phone: normalizePhone(identifier) ?? undefined },
            ],
          },
    include: { profile: true },
  });

  // Constant-ish failure path — no enumeration
  if (!user?.passwordHash) return { ok: false, code: "INVALID_CREDENTIALS" };

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) return { ok: false, code: "INVALID_CREDENTIALS" };

  if (user.status === UserStatus.SUSPENDED || user.status === UserStatus.BLOCKED) {
    return { ok: false, code: "ACCOUNT_DISABLED" };
  }

  if (
    user.email &&
    user.status === UserStatus.PENDING_VERIFICATION &&
    !user.emailVerifiedAt
  ) {
    return { ok: false, code: "EMAIL_NOT_VERIFIED" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      name: user.profile?.displayName ?? "User",
    },
  };
}

export async function requestPasswordReset(
  emailRaw: string,
  ip: string,
): Promise<{ ok: true; message: string }> {
  await consumeRateLimit({
    bucket: `forgot:ip:${ip}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  const email = normalizeEmail(emailRaw);
  if (!email) return { ok: true, message: GENERIC_OK };

  const user = await prisma.user.findUnique({ where: { email } });
  const disabled =
    user?.status === UserStatus.SUSPENDED || user?.status === UserStatus.BLOCKED;
  if (user?.passwordHash && !disabled) {
    const raw = await issueToken({
      identifier: email,
      purpose: "PASSWORD_RESET",
      ttlMs: 60 * 60 * 1000,
    });
    const link = `${appBaseUrl()}/en/auth/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(raw)}`;
    await sendEmail({
      to: email,
      subject: "Reset your Bumayed password",
      text: `Reset your password:\n${link}\n\nThis link expires in 1 hour. If you did not request this, ignore this email.`,
    });
  }

  return { ok: true, message: GENERIC_OK };
}

export async function resetPassword(input: {
  email: string;
  token: string;
  password: string;
  ip: string;
}): Promise<{ ok: true } | { ok: false; code: string; message: string }> {
  const rl = await consumeRateLimit({
    bucket: `reset:ip:${input.ip}`,
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (!rl.ok) {
    return { ok: false, code: "RATE_LIMITED", message: "Too many attempts." };
  }

  const email = normalizeEmail(input.email);
  if (!email) {
    return { ok: false, code: "INVALID_TOKEN", message: "Invalid or expired reset link." };
  }

  const consumed = await consumeToken({
    identifier: email,
    purpose: "PASSWORD_RESET",
    rawToken: input.token,
  });
  if (!consumed) {
    return { ok: false, code: "INVALID_TOKEN", message: "Invalid or expired reset link." };
  }

  const passwordHash = await hashPassword(input.password);
  // A reset proves the inbox, so it can finish verification, but it must
  // never lift a suspension or block.
  await prisma.user.updateMany({
    where: { email, status: UserStatus.PENDING_VERIFICATION },
    data: { passwordHash, status: UserStatus.ACTIVE },
  });
  await prisma.user.updateMany({
    where: {
      email,
      status: { notIn: [UserStatus.PENDING_VERIFICATION, UserStatus.SUSPENDED, UserStatus.BLOCKED] },
    },
    data: { passwordHash },
  });

  return { ok: true };
}

export async function verifyEmail(input: {
  email: string;
  token: string;
  ip: string;
}): Promise<{ ok: true } | { ok: false; code: string; message: string }> {
  const rl = await consumeRateLimit({
    bucket: `verify:ip:${input.ip}`,
    limit: 20,
    windowMs: 15 * 60 * 1000,
  });
  if (!rl.ok) {
    return { ok: false, code: "RATE_LIMITED", message: "Too many attempts." };
  }

  const email = normalizeEmail(input.email);
  if (!email) {
    return { ok: false, code: "INVALID_TOKEN", message: "Invalid or expired verification link." };
  }

  const consumed = await consumeToken({
    identifier: email,
    purpose: "EMAIL_VERIFICATION",
    rawToken: input.token,
  });
  if (!consumed) {
    return {
      ok: false,
      code: "INVALID_TOKEN",
      message: "Invalid or expired verification link.",
    };
  }

  await prisma.user.updateMany({
    where: { email },
    data: {
      emailVerifiedAt: new Date(),
      status: UserStatus.ACTIVE,
    },
  });

  return { ok: true };
}
