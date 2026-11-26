import { createHmac, timingSafeEqual } from "node:crypto";

export function signPayload(secret: string, body: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

export function verifySignature(
  secret: string,
  body: string,
  header: string | null | undefined,
): boolean {
  if (!secret || !header) return false;
  const expected = signPayload(secret, body);
  const a = Buffer.from(expected);
  const b = Buffer.from(header);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
