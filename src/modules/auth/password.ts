import bcrypt from "bcryptjs";

const ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export async function verifyPassword(
  plain: string,
  passwordHash: string,
): Promise<boolean> {
  // Reject legacy DEV seed placeholders that are not bcrypt hashes
  if (!passwordHash.startsWith("$2")) return false;
  return bcrypt.compare(plain, passwordHash);
}

export function isStrongPassword(plain: string): boolean {
  return plain.length >= 8 && plain.length <= 128;
}
