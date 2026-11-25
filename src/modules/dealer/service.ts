import {
  ListingStatus,
  PromotionStatus,
  Role,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/modules/listings/policies";

export function assertDealer(user: SessionUser) {
  if (user.role !== Role.DEALER && user.role !== Role.SUPER_ADMIN) {
    throw new Error("FORBIDDEN");
  }
}

export async function getDealerDashboard(user: SessionUser) {
  assertDealer(user);

  const dealerUserId = user.id;

  const [profile, listings, subscription] = await Promise.all([
    prisma.dealerProfile.findUnique({
      where: { userId: dealerUserId },
      include: {
        emirate: true,
        city: true,
        documents: { orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.listing.groupBy({
      by: ["status"],
      where: { sellerId: dealerUserId },
      _count: { _all: true },
    }),
    prisma.subscription.findFirst({
      where: {
        dealerId: dealerUserId,
        status: PromotionStatus.ACTIVE,
        endsAt: { gt: new Date() },
      },
      include: { package: true },
      orderBy: { endsAt: "desc" },
    }),
  ]);

  if (!profile && user.role === Role.DEALER) {
    throw new Error("NOT_FOUND");
  }

  const statusCounts = Object.fromEntries(
    listings.map((row) => [row.status, row._count._all]),
  ) as Partial<Record<ListingStatus, number>>;

  const inventoryTotal = listings.reduce((sum, row) => sum + row._count._all, 0);

  return {
    profile,
    inventory: {
      total: inventoryTotal,
      byStatus: statusCounts,
      active: statusCounts.ACTIVE ?? 0,
      pending: statusCounts.PENDING ?? 0,
      paused: statusCounts.PAUSED ?? 0,
      sold: statusCounts.SOLD ?? 0,
      expired: statusCounts.EXPIRED ?? 0,
    },
    subscription: subscription
      ? {
          id: subscription.id,
          status: subscription.status,
          startsAt: subscription.startsAt.toISOString(),
          endsAt: subscription.endsAt.toISOString(),
          listingsUsedThisPeriod: subscription.listingsUsedThisPeriod,
          featuredSlotsUsed: subscription.featuredSlotsUsed,
          package: {
            id: subscription.package.id,
            name: subscription.package.name,
            nameAr: subscription.package.nameAr,
            monthlyListingQuota: subscription.package.monthlyListingQuota,
            featuredSlots: subscription.package.featuredSlots,
            validityDays: subscription.package.validityDays,
          },
        }
      : null,
  };
}

export async function updateDealerProfile(
  user: SessionUser,
  data: {
    businessName?: string;
    businessPhone?: string;
    businessEmail?: string | null;
    whatsappNumber?: string | null;
    address?: string | null;
    description?: string | null;
    workingHours?: string | null;
  },
) {
  assertDealer(user);
  const existing = await prisma.dealerProfile.findUnique({
    where: { userId: user.id },
  });
  if (!existing) throw new Error("NOT_FOUND");

  return prisma.dealerProfile.update({
    where: { id: existing.id },
    data: {
      businessName: data.businessName ?? undefined,
      businessPhone: data.businessPhone ?? undefined,
      businessEmail: data.businessEmail === undefined ? undefined : data.businessEmail,
      whatsappNumber:
        data.whatsappNumber === undefined ? undefined : data.whatsappNumber,
      address: data.address === undefined ? undefined : data.address,
      description: data.description === undefined ? undefined : data.description,
      workingHours:
        data.workingHours === undefined ? undefined : data.workingHours,
    },
    include: { emirate: true, city: true, documents: true },
  });
}
