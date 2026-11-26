import {
  PaymentPurpose,
  PaymentStatus,
  Prisma,
  PromotionStatus,
  PromotionType,
  Role,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import type { SessionUser } from "@/modules/listings/policies";
import {
  decideEntitlement,
  PAYMENT_EVENT_TYPES,
  type ProviderEvent,
} from "./events";
import { signPayload, verifySignature } from "./signature";

const SANDBOX_DEV_SECRET = "bumayed-sandbox-webhook-dev";

export function webhookSecret(): string {
  if (env.PAYMENT_PROVIDER_WEBHOOK_SECRET) return env.PAYMENT_PROVIDER_WEBHOOK_SECRET;
  if (env.NODE_ENV !== "production") return SANDBOX_DEV_SECRET;
  throw new Error("WEBHOOK_SECRET_MISSING");
}

export function activeProvider(): string {
  return env.PAYMENT_PROVIDER ?? "sandbox";
}

/** Sandbox payments are free promotions, so production needs an explicit opt-in. */
export function sandboxPaymentsAllowed(): boolean {
  return env.NODE_ENV !== "production" || env.ALLOW_SANDBOX_PAYMENTS;
}

function assertPaymentsAvailable() {
  if (activeProvider() === "sandbox" && !sandboxPaymentsAllowed()) {
    throw new Error("PAYMENTS_UNAVAILABLE");
  }
}

function meta(payment: { metadata: Prisma.JsonValue }): Record<string, unknown> {
  return (payment.metadata ?? {}) as Record<string, unknown>;
}

export async function listPromotionOffers() {
  return prisma.promotionPrice.findMany({
    where: { isActive: true },
    orderBy: { priceAed: "asc" },
  });
}

export async function listActivePackages() {
  return prisma.package.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function listMyPayments(user: SessionUser) {
  return prisma.payment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { transactions: { orderBy: { processedAt: "desc" } } },
  });
}

async function consumeFeaturedSlot(userId: string, listingId: string) {
  const sub = await prisma.subscription.findFirst({
    where: {
      dealerId: userId,
      status: PromotionStatus.ACTIVE,
      endsAt: { gt: new Date() },
    },
    include: { package: true },
    orderBy: { endsAt: "desc" },
  });
  if (!sub) return null;
  if (sub.featuredSlotsUsed >= sub.package.featuredSlots) return null;

  const days = 7;
  const endsAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  const [promotion] = await prisma.$transaction([
    prisma.featuredPromotion.create({
      data: {
        listingId,
        type: PromotionType.FEATURED,
        status: PromotionStatus.ACTIVE,
        endsAt,
      },
    }),
    prisma.subscription.update({
      where: { id: sub.id },
      data: { featuredSlotsUsed: { increment: 1 } },
    }),
  ]);
  return promotion;
}

export async function startPromotionCheckout(input: {
  user: SessionUser;
  listingId: string;
  type: PromotionType;
}) {
  const listing = await prisma.listing.findUnique({ where: { id: input.listingId } });
  if (!listing || listing.sellerId !== input.user.id) throw new Error("FORBIDDEN");
  if (listing.status !== "ACTIVE") throw new Error("LISTING_NOT_ACTIVE");

  if (input.type === PromotionType.FEATURED && input.user.role === Role.DEALER) {
    const slotted = await consumeFeaturedSlot(input.user.id, listing.id);
    if (slotted) return { appliedWithSlot: true as const, promotionId: slotted.id };
  }

  const price = await prisma.promotionPrice.findUnique({ where: { type: input.type } });
  if (!price || !price.isActive) throw new Error("PRICE_UNAVAILABLE");

  assertPaymentsAvailable();
  const payment = await prisma.payment.create({
    data: {
      userId: input.user.id,
      purpose: PaymentPurpose.PROMOTION,
      amountAed: price.priceAed,
      provider: activeProvider(),
      status: PaymentStatus.INITIATED,
      idempotencyKey: crypto.randomUUID(),
      metadata: {
        listingId: listing.id,
        promotionType: price.type,
        durationDays: price.durationDays,
      },
    },
  });

  return {
    appliedWithSlot: false as const,
    paymentId: payment.id,
    checkoutPath: `/checkout/${payment.id}`,
  };
}

export async function startPackageCheckout(input: {
  user: SessionUser;
  packageId: string;
}) {
  if (input.user.role !== Role.DEALER && input.user.role !== Role.SUPER_ADMIN) {
    throw new Error("FORBIDDEN");
  }
  const pkg = await prisma.package.findUnique({ where: { id: input.packageId } });
  if (!pkg || !pkg.isActive) throw new Error("PACKAGE_UNAVAILABLE");

  assertPaymentsAvailable();
  const payment = await prisma.payment.create({
    data: {
      userId: input.user.id,
      purpose: PaymentPurpose.PACKAGE,
      amountAed: pkg.priceAed,
      provider: activeProvider(),
      status: PaymentStatus.INITIATED,
      idempotencyKey: crypto.randomUUID(),
      metadata: { packageId: pkg.id },
    },
  });

  return { paymentId: payment.id, checkoutPath: `/checkout/${payment.id}` };
}

export async function getOwnedPayment(user: SessionUser, paymentId: string) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment || payment.userId !== user.id) throw new Error("NOT_FOUND");
  return payment;
}

/** Sandbox only: build a signed provider event. Does not grant entitlements. */
export function buildSandboxEvent(input: {
  idempotencyKey: string;
  type: ProviderEvent["type"];
  providerEventId?: string;
}) {
  const event: ProviderEvent = {
    providerEventId: input.providerEventId ?? `sandbox_${crypto.randomUUID()}`,
    type: input.type,
    idempotencyKey: input.idempotencyKey,
    providerRef: `sandbox_ref_${input.idempotencyKey.slice(0, 8)}`,
  };
  const body = JSON.stringify(event);
  const signature = signPayload(webhookSecret(), body);
  return { body, signature, event };
}

async function applySignedWebhookInner(rawBody: string, signature: string | null) {
  let secret: string;
  try {
    secret = webhookSecret();
  } catch {
    throw new Error("WEBHOOK_SECRET_MISSING");
  }
  if (!verifySignature(secret, rawBody, signature)) {
    throw new Error("INVALID_SIGNATURE");
  }

  const parsed = JSON.parse(rawBody) as ProviderEvent;
  if (
    !parsed.providerEventId ||
    !parsed.idempotencyKey ||
    !PAYMENT_EVENT_TYPES.includes(parsed.type)
  ) {
    throw new Error("VALIDATION");
  }

  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { idempotencyKey: parsed.idempotencyKey },
    });
    if (!payment) throw new Error("NOT_FOUND");

    const stored = await tx.transaction.findUnique({
      where: { providerEventId: parsed.providerEventId },
    });
    const action = decideEntitlement({
      event: parsed,
      paymentStatus: payment.status,
      eventAlreadyStored: !!stored,
    });

    if (action === "duplicate") return { action, paymentId: payment.id };

    await tx.transaction.create({
      data: {
        paymentId: payment.id,
        providerEventId: parsed.providerEventId,
        eventType: parsed.type,
        payload: parsed as unknown as Prisma.InputJsonValue,
      },
    });

    if (action === "grant") {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.SUCCEEDED,
          provider: activeProvider(),
          providerRef: parsed.providerRef ?? payment.providerRef,
        },
      });
      await grantEntitlement(tx, payment);
    } else if (action === "mark_failed") {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED, providerRef: parsed.providerRef },
      });
    } else if (action === "mark_cancelled") {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.CANCELLED, providerRef: parsed.providerRef },
      });
    } else if (action === "revoke") {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.REFUNDED },
      });
      await revokeEntitlement(tx, payment.id);
    }

    return { action, paymentId: payment.id, userId: payment.userId };
  });
}

export async function applySignedWebhook(rawBody: string, signature: string | null) {
  const result = await applySignedWebhookInner(rawBody, signature);
  if (
    result.action === "grant" ||
    result.action === "mark_failed" ||
    result.action === "mark_cancelled" ||
    result.action === "revoke"
  ) {
    const { notifyPaymentResult } = await import("@/modules/notifications/events");
    await notifyPaymentResult({
      userId: result.userId,
      paymentId: result.paymentId,
      action: result.action,
    }).catch((err) => console.error("payment notification", err));
  }
  return result;
}

async function grantEntitlement(
  tx: Prisma.TransactionClient,
  payment: {
    id: string;
    userId: string;
    purpose: PaymentPurpose;
    metadata: Prisma.JsonValue;
  },
) {
  const data = meta(payment);
  if (payment.purpose === PaymentPurpose.PROMOTION) {
    const listingId = String(data.listingId ?? "");
    const type = data.promotionType as PromotionType;
    const days = Number(data.durationDays ?? 7);
    if (!listingId || !type) throw new Error("VALIDATION");
    await tx.featuredPromotion.create({
      data: {
        listingId,
        type,
        status: PromotionStatus.ACTIVE,
        endsAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
        paymentId: payment.id,
      },
    });
    return;
  }

  const packageId = String(data.packageId ?? "");
  const pkg = await tx.package.findUnique({ where: { id: packageId } });
  if (!pkg) throw new Error("PACKAGE_UNAVAILABLE");
  const startsAt = new Date();
  const endsAt = new Date(startsAt.getTime() + pkg.validityDays * 24 * 60 * 60 * 1000);
  await tx.subscription.create({
    data: {
      dealerId: payment.userId,
      packageId: pkg.id,
      startsAt,
      endsAt,
      status: PromotionStatus.ACTIVE,
      paymentId: payment.id,
    },
  });
}

async function revokeEntitlement(tx: Prisma.TransactionClient, paymentId: string) {
  await tx.featuredPromotion.updateMany({
    where: { paymentId, status: PromotionStatus.ACTIVE },
    data: { status: PromotionStatus.CANCELLED },
  });
  await tx.subscription.updateMany({
    where: { paymentId, status: PromotionStatus.ACTIVE },
    data: { status: PromotionStatus.CANCELLED },
  });
}

const QUOTA_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

/** Start of the current 30-day quota period, counted from the package start. */
export function quotaPeriodStart(startsAt: Date, now: Date): Date {
  const elapsed = Math.max(0, now.getTime() - startsAt.getTime());
  const periods = Math.floor(elapsed / QUOTA_PERIOD_MS);
  return new Date(startsAt.getTime() + periods * QUOTA_PERIOD_MS);
}

/**
 * How many ads a dealer has used this period. Counted from the listings
 * themselves (ads created this period that were submitted at least once), so
 * drafts and failed saves do not count, the count resets each period, and
 * removing an ad does not give the slot back.
 */
export async function dealerQuotaUsage(dealerId: string, now = new Date()) {
  const sub = await prisma.subscription.findFirst({
    where: {
      dealerId,
      status: PromotionStatus.ACTIVE,
      endsAt: { gt: now },
    },
    include: { package: true },
    orderBy: { endsAt: "desc" },
  });
  if (!sub) return null;
  const periodStart = quotaPeriodStart(sub.startsAt, now);
  const used = await prisma.listing.count({
    where: {
      sellerId: dealerId,
      submittedAt: { not: null },
      createdAt: { gte: periodStart },
    },
  });
  return { quota: sub.package.monthlyListingQuota, used, periodStart };
}

/** Call before an ad is submitted for the first time. */
export async function assertListingQuota(user: SessionUser) {
  if (user.role !== Role.DEALER) return;
  const usage = await dealerQuotaUsage(user.id);
  if (!usage || usage.quota == null) return;
  if (usage.used >= usage.quota) throw new Error("QUOTA_EXCEEDED");
}
