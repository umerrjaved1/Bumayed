import { invalidatePublicListings } from "@/modules/listings/invalidate";
import { ListingStatus, NotificationType, PromotionStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { assertTransition } from "@/modules/listings/lifecycle";
import { notify } from "./service";

const SOON_MS = 3 * 24 * 60 * 60 * 1000;

export async function notifyListingEvent(input: {
  sellerId: string;
  listingId: string;
  title: string;
  status: "PENDING" | "ACTIVE" | "REJECTED" | "EXPIRED" | "EXPIRY_SOON";
  reason?: string | null;
  /**
   * When this cycle started (submittedAt, approvedAt, rejectedAt or expiresAt).
   * Part of the dedup key, so a second rejection or a renewal's expiry is
   * still sent while retries of the same event are not.
   */
  cycleAt?: Date | null;
}) {
  const map = {
    PENDING: NotificationType.LISTING_SUBMITTED,
    ACTIVE: NotificationType.LISTING_APPROVED,
    REJECTED: NotificationType.LISTING_REJECTED,
    EXPIRED: NotificationType.LISTING_EXPIRED,
    EXPIRY_SOON: NotificationType.LISTING_EXPIRY_SOON,
  } as const;
  const type = map[input.status];
  const reason = input.reason ? ` ${input.reason}` : "";
  return notify({
    userId: input.sellerId,
    type,
    dedupKey: `${type}:${input.listingId}:${input.status === "EXPIRY_SOON" ? "soon" : input.status}:${input.cycleAt?.toISOString() ?? "-"}`,
    copy: {
      titleEn: `Listing update: ${input.title}`,
      titleAr: `تحديث الإعلان: ${input.title}`,
      bodyEn: `Status: ${input.status}.${reason}`,
      bodyAr: `الحالة: ${input.status}.${reason}`,
    },
    data: { listingId: input.listingId, status: input.status },
  });
}

export async function notifyPaymentResult(input: {
  userId: string;
  paymentId: string;
  action: string;
}) {
  return notify({
    userId: input.userId,
    type: NotificationType.PAYMENT_RESULT,
    dedupKey: `PAYMENT_RESULT:${input.paymentId}:${input.action}`,
    copy: {
      titleEn: "Payment update",
      titleAr: "تحديث الدفع",
      bodyEn: `Payment ${input.paymentId.slice(0, 8)} is ${input.action}.`,
      bodyAr: `الدفعة ${input.paymentId.slice(0, 8)}: ${input.action}.`,
    },
    data: { paymentId: input.paymentId, action: input.action },
  });
}

/** Expiry warnings, expired listings, and package expiry. Safe to run repeatedly. */
export async function sweepExpiryNotifications(now = new Date()) {
  const backfilled = await backfillMissingExpiry(now);
  const soon = new Date(now.getTime() + SOON_MS);
  const expiring = await prisma.listing.findMany({
    where: {
      status: ListingStatus.ACTIVE,
      expiresAt: { gt: now, lte: soon },
    },
    select: { id: true, sellerId: true, title: true, expiresAt: true },
    take: 100,
  });
  for (const row of expiring) {
    await notifyListingEvent({
      sellerId: row.sellerId,
      listingId: row.id,
      title: row.title,
      status: "EXPIRY_SOON",
      cycleAt: row.expiresAt,
    });
  }

  const expired = await prisma.listing.findMany({
    where: { status: ListingStatus.ACTIVE, expiresAt: { lte: now } },
    select: { id: true, sellerId: true, title: true, status: true, expiresAt: true },
    take: 100,
  });
  for (const row of expired) {
    if (!assertCanExpire(row.status)) continue;
    await prisma.listing.update({
      where: { id: row.id },
      data: { status: ListingStatus.EXPIRED },
    });
    invalidatePublicListings();
    await notifyListingEvent({
      sellerId: row.sellerId,
      listingId: row.id,
      title: row.title,
      status: "EXPIRED",
      cycleAt: row.expiresAt,
    });
  }

  const packages = await prisma.subscription.findMany({
    where: {
      status: PromotionStatus.ACTIVE,
      endsAt: { gt: now, lte: soon },
    },
    select: { id: true, dealerId: true, endsAt: true },
    take: 100,
  });
  for (const sub of packages) {
    await notify({
      userId: sub.dealerId,
      type: NotificationType.PACKAGE_EXPIRY,
      dedupKey: `PACKAGE_EXPIRY:${sub.id}`,
      copy: {
        titleEn: "Dealer package ending soon",
        titleAr: "باقة المعرض تنتهي قريباً",
        bodyEn: `Your package ends on ${sub.endsAt.toISOString().slice(0, 10)}.`,
        bodyAr: `تنتهي باقتك في ${sub.endsAt.toISOString().slice(0, 10)}.`,
      },
    });
  }

  return {
    backfilled,
    expiring: expiring.length,
    expired: expired.length,
    packages: packages.length,
  };
}

function assertCanExpire(status: ListingStatus) {
  try {
    assertTransition(status, ListingStatus.EXPIRED, "system");
    return true;
  } catch {
    return false;
  }
}

const RUN_MS = 60 * 24 * 60 * 60 * 1000;
const GRACE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Ads approved before approval set an expiry date have none, so they never
 * expired. Give each one 60 days from approval, but at least 7 days from now
 * so the seller still gets the 3-day warning before it ends.
 */
async function backfillMissingExpiry(now: Date): Promise<number> {
  const rows = await prisma.listing.findMany({
    where: { status: ListingStatus.ACTIVE, expiresAt: null },
    select: { id: true, approvedAt: true, createdAt: true },
    take: 500,
  });
  for (const row of rows) {
    const from = (row.approvedAt ?? row.createdAt).getTime();
    const expiresAt = new Date(Math.max(from + RUN_MS, now.getTime() + GRACE_MS));
    await prisma.listing.update({ where: { id: row.id }, data: { expiresAt } });
  }
  return rows.length;
}
