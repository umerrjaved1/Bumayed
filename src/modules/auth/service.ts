import { Role, UserStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  actionEmailHtml,
  appBaseUrl,
  isEmailDeliveryConfigured,
  sendEmail,
} from "@/lib/email";
import { hashPassword, verifyPassword } from "./password";
import { consumeRateLimit } from "./rate-limit";
import type { z } from "zod";
import type { registerSchema } from "./schemas";
import { consumeToken, issueToken } from "./tokens";

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * What happened to verification at sign-up, so the next screen can tell the
 * person exactly what to do:
 * - email_sent: a link is on its way; they must click it before signing in
 * - email_failed: the provider rejected the send; offer "send again"
 * - email_unavailable: no email service is connected yet, so the account is
 *   active right away and the email is confirmed later
 * - phone_only: mobile number saved, account active (SMS verification is deferred)
 */
export type VerificationMode =
  | "email_sent"
  | "email_failed"
  | "email_unavailable"
  | "phone_only";

type Locale = "en" | "ar";
const asLocale = (l: string | undefined): Locale => (l === "ar" ? "ar" : "en");

const VERIFY_COPY: Record<
  Locale,
  { subject: string; heading: string; body: string; button: string; foot: string }
> = {
  en: {
    subject: "Verify your BuMayed account",
    heading: "Confirm your email",
    body: "Welcome to BuMayed! Tap the button to verify your email address and activate your account.",
    button: "Verify my email",
    foot: "This link expires in 24 hours. If the button does not work, copy this link into your browser:",
  },
  ar: {
    subject: "فعّل حسابك في بوماید",
    heading: "أكّد بريدك الإلكتروني",
    body: "أهلاً بك في بوماید! اضغط على الزر لتأكيد بريدك الإلكتروني وتفعيل حسابك.",
    button: "تأكيد بريدي",
    foot: "ينتهي هذا الرابط خلال 24 ساعة. إذا لم يعمل الزر، انسخ الرابط التالي في المتصفح:",
  },
};

/** Issues a fresh single-use link (replacing older ones) and emails it. */
async function sendVerificationEmail(email: string, locale: Locale) {
  const raw = await issueToken({
    identifier: email,
    purpose: "EMAIL_VERIFICATION",
    ttlMs: 24 * 60 * 60 * 1000,
  });
  const link = `${appBaseUrl()}/${locale}/auth/verify-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(raw)}`;
  const c = VERIFY_COPY[locale];
  await sendEmail({
    to: email,
    subject: c.subject,
    text: `${c.body}\n\n${link}\n\n${c.foot}`,
    html: actionEmailHtml({
      dir: locale === "ar" ? "rtl" : "ltr",
      brand: locale === "ar" ? "بوماید" : "BuMayed",
      heading: c.heading,
      body: c.body,
      buttonLabel: c.button,
      link,
      footnote: c.foot,
    }),
  });
}

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
): Promise<
  | { ok: true; verification: VerificationMode }
  | { ok: false; code: string; message: string }
> {
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

  // With no email service connected, nobody can receive a link, so email
  // accounts start active instead of being locked out. Verification turns
  // into a real email step automatically once EMAIL_PROVIDER_API_KEY is set.
  const canEmail = isEmailDeliveryConfigured();
  const plannedMode: VerificationMode = !email
    ? "phone_only"
    : canEmail
      ? "email_sent"
      : "email_unavailable";

  if (email) {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      // Avoid account enumeration — same generic response as success path for duplicates
      return { ok: true, verification: plannedMode };
    }
  }
  if (phone) {
    const exists = await prisma.user.findUnique({ where: { phone } });
    if (exists) return { ok: true, verification: plannedMode };
  }

  const passwordHash = await hashPassword(input.password);
  const role = input.accountType === "dealer" ? Role.DEALER : Role.INDIVIDUAL;
  // Phone-only (OTP deferred) activates immediately. Email accounts wait for
  // their link, but only when a link can actually be delivered.
  const status =
    email && canEmail ? UserStatus.PENDING_VERIFICATION : UserStatus.ACTIVE;

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

  let verification: VerificationMode = plannedMode;
  if (email && canEmail) {
    try {
      await sendVerificationEmail(email, asLocale(input.locale));
    } catch (err) {
      // The account exists; let them ask for another link instead of failing.
      console.error("verification email failed", err);
      verification = "email_failed";
    }
  }

  void user;
  return { ok: true, verification };
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
    if (isEmailDeliveryConfigured()) {
      return { ok: false, code: "EMAIL_NOT_VERIFIED" };
    }
    // No way to deliver a link yet: let them in rather than lock them out.
    // emailVerifiedAt stays empty, so the email is still confirmed later.
    user.status = UserStatus.ACTIVE;
    await prisma.user.update({
      where: { id: user.id },
      data: { status: UserStatus.ACTIVE },
    });
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
      subject: "Reset your BuMayed password",
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

  // Confirm the email for everyone with it, but only finish activation for
  // accounts that were waiting: a link must never lift a suspension or block.
  await prisma.user.updateMany({
    where: { email },
    data: { emailVerifiedAt: new Date() },
  });
  await prisma.user.updateMany({
    where: { email, status: UserStatus.PENDING_VERIFICATION },
    data: { status: UserStatus.ACTIVE },
  });

  return { ok: true };
}

/**
 * "Send me a new link". Takes an email or mobile number and always answers
 * the same way for unknown accounts, so it cannot be used to find out who
 * has registered. Limited per address and per visitor.
 */
export async function resendVerification(input: {
  identifier: string;
  locale?: string;
  ip: string;
}): Promise<
  | { ok: true }
  | { ok: false; code: "RATE_LIMITED" | "EMAIL_UNAVAILABLE" }
> {
  const ipLimit = await consumeRateLimit({
    bucket: `resend:ip:${input.ip}`,
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (!ipLimit.ok) return { ok: false, code: "RATE_LIMITED" };
  if (!isEmailDeliveryConfigured()) {
    return { ok: false, code: "EMAIL_UNAVAILABLE" };
  }

  const identifier = input.identifier.trim();
  const email = identifier.includes("@") ? normalizeEmail(identifier) : null;
  const phone = !email ? normalizePhone(identifier) : null;
  if (!email && !phone) return { ok: true };

  const user = await prisma.user.findFirst({
    where: email ? { email } : { phone: phone! },
    select: { email: true, status: true, emailVerifiedAt: true },
  });
  const blocked =
    user?.status === UserStatus.SUSPENDED || user?.status === UserStatus.BLOCKED;
  if (!user?.email || user.emailVerifiedAt || blocked) return { ok: true };

  const perAddress = await consumeRateLimit({
    bucket: `resend:email:${user.email}`,
    limit: 3,
    windowMs: 10 * 60 * 1000,
  });
  if (!perAddress.ok) return { ok: false, code: "RATE_LIMITED" };

  try {
    await sendVerificationEmail(user.email, asLocale(input.locale));
  } catch (err) {
    console.error("resend verification email failed", err);
  }
  return { ok: true };
}
