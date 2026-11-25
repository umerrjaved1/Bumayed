import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

/** Safe audit metadata — never passwords, OTPs, or payment secrets. */
export async function writeAuditLog(input: {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Prisma.InputJsonValue;
  ip?: string | null;
}) {
  return prisma.adminActivityLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      metadata: input.metadata ?? undefined,
      ip: input.ip ?? null,
    },
  });
}
