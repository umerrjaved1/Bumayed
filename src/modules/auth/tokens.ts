import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

export type TokenPurpose = "EMAIL_VERIFICATION" | "PASSWORD_RESET";

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function generateRawToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Create a single-use hashed token; replaces any existing token for the same identifier+purpose. */
export async function issueToken(input: {
  identifier: string;
  purpose: TokenPurpose;
  ttlMs: number;
}): Promise<string> {
  const raw = generateRawToken();
  const tokenHash = hashToken(raw);
  const expiresAt = new Date(Date.now() + input.ttlMs);

  await prisma.verificationToken.deleteMany({
    where: { identifier: input.identifier, purpose: input.purpose },
  });
  await prisma.verificationToken.create({
    data: {
      identifier: input.identifier,
      purpose: input.purpose,
      tokenHash,
      expiresAt,
    },
  });

  return raw;
}

export async function consumeToken(input: {
  identifier: string;
  purpose: TokenPurpose;
  rawToken: string;
}): Promise<boolean> {
  const tokenHash = hashToken(input.rawToken);
  const row = await prisma.verificationToken.findFirst({
    where: {
      identifier: input.identifier,
      purpose: input.purpose,
      tokenHash,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  if (!row) return false;

  await prisma.verificationToken.update({
    where: { id: row.id },
    data: { consumedAt: new Date() },
  });
  return true;
}
