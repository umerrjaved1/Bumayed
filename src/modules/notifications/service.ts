import {
  NotificationChannel,
  NotificationType,
  Prisma,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

type Copy = { titleEn: string; titleAr: string; bodyEn: string; bodyAr: string };

const DEFAULT_ON = { email: true, inApp: true };

function channelOn(
  toggles: Prisma.JsonValue,
  type: NotificationType,
  channel: "email" | "inApp",
): boolean {
  const all = (toggles ?? {}) as Record<string, { email?: boolean; inApp?: boolean }>;
  const row = all[type];
  if (!row) return DEFAULT_ON[channel];
  return row[channel] !== false;
}

/**
 * In-app row plus email. dedupKey is unique, so a retried event does not send twice.
 */
export async function notify(input: {
  userId: string;
  type: NotificationType;
  dedupKey: string;
  copy: Copy;
  data?: Prisma.InputJsonValue;
}) {
  const [user, prefs] = await Promise.all([
    prisma.user.findUnique({
      where: { id: input.userId },
      select: { email: true },
    }),
    prisma.notificationPreference.findUnique({ where: { userId: input.userId } }),
  ]);
  if (!user) return { sent: false as const, reason: "missing-user" };

  const toggles = prefs?.toggles ?? {};
  const inApp = channelOn(toggles, input.type, "inApp");
  const email = channelOn(toggles, input.type, "email");
  if (!inApp && !email) return { sent: false as const, reason: "muted" };

  try {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        channel: inApp ? NotificationChannel.IN_APP : NotificationChannel.EMAIL,
        type: input.type,
        dedupKey: input.dedupKey,
        titleEn: input.copy.titleEn,
        titleAr: input.copy.titleAr,
        bodyEn: input.copy.bodyEn,
        bodyAr: input.copy.bodyAr,
        data: input.data,
      },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return { sent: false as const, reason: "duplicate" };
    }
    throw err;
  }

  if (email && user.email) {
    try {
      await sendEmail({
        to: user.email,
        subject: input.copy.titleEn,
        text: input.copy.bodyEn,
      });
    } catch (err) {
      console.error("notification email failed", err);
    }
  }

  return { sent: true as const };
}

export async function listInbox(userId: string) {
  return prisma.notification.findMany({
    where: { userId, channel: NotificationChannel.IN_APP },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function markRead(userId: string, id: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { readAt: new Date() },
  });
}

export async function getPreferences(userId: string) {
  const row = await prisma.notificationPreference.findUnique({ where: { userId } });
  return (row?.toggles ?? {}) as Record<string, { email?: boolean; inApp?: boolean }>;
}

export async function savePreferences(
  userId: string,
  toggles: Record<string, { email?: boolean; inApp?: boolean }>,
) {
  return prisma.notificationPreference.upsert({
    where: { userId },
    create: { userId, toggles },
    update: { toggles },
  });
}
