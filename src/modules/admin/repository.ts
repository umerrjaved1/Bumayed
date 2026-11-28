import {
  ListingStatus,
  Prisma,
  PromotionStatus,
  PromotionType,
  ReportStatus,
  Role,
  UserStatus,
  DealerVerificationStatus,
  ContentStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function getDashboardCounts() {
  const [
    users,
    dealers,
    listings,
    activeListings,
    pendingApprovals,
    reports,
    expiredListings,
    revenueAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: Role.DEALER } }),
    prisma.listing.count({
      where: { status: { not: ListingStatus.REMOVED } },
    }),
    prisma.listing.count({ where: { status: ListingStatus.ACTIVE } }),
    prisma.listing.count({ where: { status: ListingStatus.PENDING } }),
    prisma.report.count({ where: { status: ReportStatus.OPEN } }),
    prisma.listing.count({ where: { status: ListingStatus.EXPIRED } }),
    prisma.payment.aggregate({
      where: { status: "SUCCEEDED" },
      _sum: { amountAed: true },
    }),
  ]);

  return {
    users,
    dealers,
    listings,
    activeListings,
    pendingApprovals,
    reports,
    expiredListings,
    revenueAed: revenueAgg._sum.amountAed ?? 0,
  };
}

export async function listUsers(input: {
  q?: string;
  role?: Role;
  status?: UserStatus;
  take?: number;
}) {
  const take = input.take ?? 50;
  const where: Prisma.UserWhereInput = {};
  if (input.role) where.role = input.role;
  if (input.status) where.status = input.status;
  if (input.q) {
    where.OR = [
      { email: { contains: input.q } },
      { phone: { contains: input.q } },
      { profile: { displayName: { contains: input.q } } },
    ];
  }
  return prisma.user.findMany({
    where,
    take,
    orderBy: { createdAt: "desc" },
    include: {
      profile: true,
      dealerProfile: true,
      _count: { select: { listings: true } },
    },
  });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
      dealerProfile: true,
      _count: { select: { listings: true } },
    },
  });
}

export async function updateUserStatus(id: string, status: UserStatus) {
  return prisma.user.update({
    where: { id },
    data: { status },
    include: { profile: true, dealerProfile: true },
  });
}

export async function updateUserRole(id: string, role: Role) {
  return prisma.user.update({
    where: { id },
    data: { role },
    include: { profile: true },
  });
}

export async function listDealers(input: { status?: DealerVerificationStatus; take?: number }) {
  return prisma.dealerProfile.findMany({
    where: input.status ? { verificationStatus: input.status } : undefined,
    take: input.take ?? 50,
    orderBy: { updatedAt: "desc" },
    include: {
      user: { include: { profile: true } },
      emirate: true,
      city: true,
      documents: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function updateDealerVerification(input: {
  dealerId: string;
  status: DealerVerificationStatus;
  note?: string | null;
}) {
  return prisma.dealerProfile.update({
    where: { id: input.dealerId },
    data: {
      verificationStatus: input.status,
      verificationNote: input.note ?? null,
      verifiedAt:
        input.status === DealerVerificationStatus.APPROVED ? new Date() : null,
    },
    include: {
      user: { include: { profile: true } },
      documents: true,
    },
  });
}

export async function listListingsForAdmin(input: {
  status?: ListingStatus;
  q?: string;
  take?: number;
}) {
  const where: Prisma.ListingWhereInput = {};
  if (input.status) where.status = input.status;
  if (input.q) {
    where.OR = [
      { title: { contains: input.q } },
      { slug: { contains: input.q } },
    ];
  }
  return prisma.listing.findMany({
    where,
    take: input.take ?? 50,
    // Nulls last, or drafts sort above pending ads and push them out of the first 50.
    orderBy: [
      { submittedAt: { sort: "desc", nulls: "last" } },
      { createdAt: "desc" },
    ],
    include: {
      seller: { include: { profile: true, dealerProfile: true } },
      category: true,
      make: true,
      model: true,
      emirate: true,
      city: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      reports: { where: { status: ReportStatus.OPEN } },
    },
  });
}

export async function createFeaturePromotion(input: {
  listingId: string;
  type: PromotionType;
  days: number;
}) {
  const endsAt = new Date(Date.now() + input.days * 24 * 60 * 60 * 1000);
  return prisma.featuredPromotion.create({
    data: {
      listingId: input.listingId,
      type: input.type,
      status: PromotionStatus.ACTIVE,
      endsAt,
    },
  });
}

export async function listReports(input: { status?: ReportStatus; take?: number }) {
  return prisma.report.findMany({
    where: input.status ? { status: input.status } : undefined,
    take: input.take ?? 50,
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
        select: { id: true, title: true, slug: true, status: true },
      },
      reporter: {
        select: { id: true, email: true, profile: { select: { displayName: true } } },
      },
      resolvedBy: {
        select: { id: true, email: true, profile: { select: { displayName: true } } },
      },
    },
  });
}

export async function createReport(data: Prisma.ReportCreateInput) {
  return prisma.report.create({ data });
}

export async function updateReport(
  id: string,
  data: Prisma.ReportUpdateInput,
) {
  return prisma.report.update({
    where: { id },
    data,
    include: {
      listing: { select: { id: true, title: true, slug: true, status: true } },
    },
  });
}

export async function listCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { makes: true, listings: true } },
      fields: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function listMakes(categoryId?: string) {
  return prisma.vehicleMake.findMany({
    where: categoryId ? { categoryId } : undefined,
    orderBy: { nameEn: "asc" },
    include: {
      category: true,
      _count: { select: { models: true } },
    },
  });
}

export async function listEmiratesWithCities() {
  return prisma.emirate.findMany({
    orderBy: { nameEn: "asc" },
    include: {
      cities: {
        orderBy: { nameEn: "asc" },
        include: { areas: { orderBy: { nameEn: "asc" } } },
      },
    },
  });
}

export async function listPackages() {
  return prisma.package.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function upsertPackage(
  id: string | null,
  data: Prisma.PackageCreateInput,
) {
  if (id) {
    return prisma.package.update({ where: { id }, data });
  }
  return prisma.package.create({ data });
}

export async function listPromotionPrices() {
  return prisma.promotionPrice.findMany({ orderBy: { type: "asc" } });
}

export async function listContentPages() {
  return prisma.contentPage.findMany({ orderBy: { slug: "asc" } });
}

export async function updateContentPage(
  slug: string,
  data: {
    titleEn: string;
    titleAr: string;
    bodyEn: string;
    bodyAr: string;
    status?: ContentStatus;
  },
) {
  return prisma.contentPage.update({
    where: { slug },
    data: {
      ...data,
      publishedAt:
        data.status === ContentStatus.PUBLISHED ? new Date() : undefined,
    },
  });
}

export async function listBanners() {
  return prisma.banner.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function listAuditLogs(take = 100) {
  return prisma.adminActivityLog.findMany({
    take,
    orderBy: { createdAt: "desc" },
    include: {
      actor: {
        select: {
          id: true,
          email: true,
          role: true,
          profile: { select: { displayName: true } },
        },
      },
    },
  });
}

export async function listAdminUsers() {
  return prisma.user.findMany({
    where: { role: { in: [Role.MODERATOR, Role.SUPER_ADMIN] } },
    orderBy: { createdAt: "asc" },
    include: { profile: true },
  });
}

export async function createBanner(data: {
  titleEn: string;
  titleAr?: string | null;
  imageKey: string;
  linkUrl?: string | null;
  position: string;
  sortOrder?: number;
}) {
  return prisma.banner.create({
    data: {
      titleEn: data.titleEn,
      titleAr: data.titleAr ?? null,
      imageKey: data.imageKey,
      linkUrl: data.linkUrl ?? null,
      position: data.position,
      sortOrder: data.sortOrder ?? 0,
    },
  });
}
