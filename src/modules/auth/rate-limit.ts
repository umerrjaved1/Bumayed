import { prisma } from "@/lib/prisma";

type RateLimitOptions = {
  bucket: string;
  limit: number;
  windowMs: number;
};

/**
 * Sliding fixed-window rate limiter persisted in PostgreSQL.
 * Returns { ok: false } when the limit is exceeded (without incrementing past limit+1).
 */
export async function consumeRateLimit({
  bucket,
  limit,
  windowMs,
}: RateLimitOptions): Promise<{ ok: boolean; remaining: number }> {
  const now = new Date();
  const existing = await prisma.authRateLimit.findUnique({ where: { bucket } });

  if (!existing || now.getTime() - existing.windowStart.getTime() > windowMs) {
    await prisma.authRateLimit.upsert({
      where: { bucket },
      create: { bucket, count: 1, windowStart: now },
      update: { count: 1, windowStart: now },
    });
    return { ok: true, remaining: limit - 1 };
  }

  if (existing.count >= limit) {
    return { ok: false, remaining: 0 };
  }

  const updated = await prisma.authRateLimit.update({
    where: { bucket },
    data: { count: { increment: 1 } },
  });
  return { ok: true, remaining: Math.max(0, limit - updated.count) };
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}
