import type { Prisma } from "@/generated/prisma/client";
import { ListingStatus, Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  CATEGORY_CODE_TO_ENUM,
  PAGE_SIZE,
  type ListingQuery,
  type ListingSort,
  type VehicleCategoryCode,
} from "./types";

const publicInclude = {
  category: true,
  make: true,
  model: true,
  trim: true,
  emirate: true,
  city: true,
  images: { orderBy: { sortOrder: "asc" as const } },
  video: true,
  promotions: {
    where: { status: "ACTIVE" as const },
    select: { type: true, status: true, endsAt: true },
  },
  seller: {
    include: {
      profile: true,
      dealerProfile: true,
    },
  },
} satisfies Prisma.ListingInclude;

function sortToOrderBy(
  sort: ListingSort,
): Prisma.ListingOrderByWithRelationInput[] {
  switch (sort) {
    case "priceAsc":
      return [{ priceAed: "asc" }, { id: "asc" }];
    case "priceDesc":
      return [{ priceAed: "desc" }, { id: "asc" }];
    case "mileageAsc":
      return [{ mileageKm: "asc" }, { id: "asc" }];
    case "yearDesc":
      return [{ year: "desc" }, { id: "asc" }];
    default:
      return [{ createdAt: "desc" }, { id: "asc" }];
  }
}

function upper(v: string | undefined): string | undefined {
  return v ? v.toUpperCase() : undefined;
}

/** Build Prisma where for server-side filters (playbook §7.3). */
export function buildSearchWhere(q: ListingQuery): Prisma.ListingWhereInput {
  const and: Prisma.ListingWhereInput[] = [
    { status: ListingStatus.ACTIVE },
    { category: { code: CATEGORY_CODE_TO_ENUM[q.category] } },
  ];

  if (q.keyword) {
    and.push({
      OR: [
        { title: { contains: q.keyword, mode: "insensitive" } },
        { description: { contains: q.keyword, mode: "insensitive" } },
        { make: { nameEn: { contains: q.keyword, mode: "insensitive" } } },
        { model: { nameEn: { contains: q.keyword, mode: "insensitive" } } },
      ],
    });
  }
  if (q.make) {
    and.push({ make: { nameEn: { equals: q.make, mode: "insensitive" } } });
  }
  if (q.priceMin != null) and.push({ priceAed: { gte: q.priceMin } });
  if (q.priceMax != null) and.push({ priceAed: { lte: q.priceMax } });
  if (q.yearMin != null) and.push({ year: { gte: q.yearMin } });
  if (q.yearMax != null) and.push({ year: { lte: q.yearMax } });
  if (q.mileageMax != null) and.push({ mileageKm: { lte: q.mileageMax } });
  if (q.emirate) and.push({ emirate: { code: q.emirate.toUpperCase() } });
  if (q.sellerType === "dealer") {
    and.push({ seller: { role: Role.DEALER } });
  } else if (q.sellerType === "individual") {
    and.push({ seller: { role: Role.INDIVIDUAL } });
  }

  // Category-specific specs (stored uppercase in seed)
  if (q.condition) {
    and.push({
      specs: { path: ["condition"], equals: upper(q.condition) },
    });
  }
  if (q.transmission) {
    and.push({
      specs: { path: ["transmission"], equals: upper(q.transmission) },
    });
  }
  if (q.fuelType) {
    and.push({
      specs: { path: ["fuelType"], equals: upper(q.fuelType) },
    });
  }
  if (q.regionalSpec) {
    and.push({
      specs: { path: ["regionalSpec"], equals: upper(q.regionalSpec) },
    });
  }
  if (q.motoType) {
    and.push({
      specs: { path: ["motorcycleType"], equals: q.motoType.toLowerCase() },
    });
  }
  if (q.boatType) {
    and.push({
      specs: { path: ["boatType"], equals: q.boatType.toLowerCase() },
    });
  }

  return { AND: and };
}

export async function searchListings(q: ListingQuery) {
  const where = buildSearchWhere(q);
  const total = await prisma.listing.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(q.page, totalPages);

  const rows = await prisma.listing.findMany({
    where,
    include: publicInclude,
    orderBy: sortToOrderBy(q.sort),
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return { rows, total, page, totalPages };
}

export async function findActiveBySlug(slug: string) {
  return prisma.listing.findFirst({
    where: { slug, status: ListingStatus.ACTIVE },
    include: publicInclude,
  });
}

export async function findBySlug(slug: string) {
  return prisma.listing.findFirst({
    where: { slug },
    include: publicInclude,
  });
}

export async function findFeatured(limit = 6) {
  return prisma.listing.findMany({
    where: {
      status: ListingStatus.ACTIVE,
      promotions: {
        some: {
          type: "FEATURED",
          status: "ACTIVE",
          endsAt: { gt: new Date() },
        },
      },
    },
    include: publicInclude,
    orderBy: [{ createdAt: "desc" }],
    take: limit,
  });
}

export async function findLatest(limit = 6) {
  return prisma.listing.findMany({
    where: { status: ListingStatus.ACTIVE },
    include: publicInclude,
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    take: limit,
  });
}

export async function findSimilar(
  category: VehicleCategoryCode,
  excludeSlug: string,
  limit = 3,
) {
  return prisma.listing.findMany({
    where: {
      status: ListingStatus.ACTIVE,
      slug: { not: excludeSlug },
      category: { code: CATEGORY_CODE_TO_ENUM[category] },
    },
    include: publicInclude,
    orderBy: [{ createdAt: "desc" }],
    take: limit,
  });
}

export async function findMakesForCategory(category: VehicleCategoryCode) {
  const rows = await prisma.vehicleMake.findMany({
    where: {
      isActive: true,
      category: { code: CATEGORY_CODE_TO_ENUM[category] },
    },
    orderBy: { nameEn: "asc" },
    select: { nameEn: true },
  });
  return rows.map((r) => r.nameEn);
}

export async function findListingById(id: string) {
  return prisma.listing.findUnique({
    where: { id },
    include: publicInclude,
  });
}

export async function updateListingStatus(
  id: string,
  data: Prisma.ListingUpdateInput,
) {
  return prisma.listing.update({ where: { id }, data, include: publicInclude });
}

export async function findSellerListings(sellerId: string, status?: ListingStatus) {
  return prisma.listing.findMany({
    where: {
      sellerId,
      ...(status ? { status } : { status: { not: ListingStatus.REMOVED } }),
    },
    include: publicInclude,
    orderBy: [{ updatedAt: "desc" }],
  });
}

export async function createListing(data: Prisma.ListingCreateInput) {
  return prisma.listing.create({ data, include: publicInclude });
}

export async function updateListing(id: string, data: Prisma.ListingUpdateInput) {
  return prisma.listing.update({ where: { id }, data, include: publicInclude });
}

export async function findCategoryByCode(code: VehicleCategoryCode) {
  return prisma.category.findUnique({
    where: { code: CATEGORY_CODE_TO_ENUM[code] },
  });
}

export async function findEmirateByCode(code: string) {
  return prisma.emirate.findUnique({ where: { code } });
}

export async function listCitiesByEmirate(emirateId: string) {
  return prisma.city.findMany({
    where: { emirateId },
    orderBy: { nameEn: "asc" },
  });
}

export async function listMakesWithModels(category: VehicleCategoryCode) {
  return prisma.vehicleMake.findMany({
    where: {
      isActive: true,
      category: { code: CATEGORY_CODE_TO_ENUM[category] },
    },
    include: {
      models: {
        include: { trims: true },
        orderBy: { nameEn: "asc" },
      },
    },
    orderBy: { nameEn: "asc" },
  });
}

export async function addListingImage(data: {
  listingId: string;
  objectKey: string;
  mime: string;
  sizeBytes: number;
  sortOrder: number;
  isPrimary: boolean;
}) {
  return prisma.listingImage.create({ data });
}

export async function listListingImages(listingId: string) {
  return prisma.listingImage.findMany({
    where: { listingId },
    orderBy: { sortOrder: "asc" },
  });
}

export async function deleteListingImageRow(id: string) {
  return prisma.listingImage.delete({ where: { id } });
}

export async function countListingImages(listingId: string) {
  return prisma.listingImage.count({ where: { listingId } });
}

export async function upsertListingVideo(data: {
  listingId: string;
  provider: "YOUTUBE" | "INSTAGRAM" | "TIKTOK";
  originalUrl: string;
  embedUrl: string | null;
}) {
  return prisma.listingVideo.upsert({
    where: { listingId: data.listingId },
    create: data,
    update: {
      provider: data.provider,
      originalUrl: data.originalUrl,
      embedUrl: data.embedUrl,
    },
  });
}

export async function deleteListingVideo(listingId: string) {
  return prisma.listingVideo.deleteMany({ where: { listingId } });
}

export async function addFavorite(userId: string, listingId: string) {
  return prisma.favorite.upsert({
    where: { userId_listingId: { userId, listingId } },
    create: { userId, listingId },
    update: {},
  });
}

export async function removeFavorite(userId: string, listingId: string) {
  return prisma.favorite.deleteMany({ where: { userId, listingId } });
}

export async function listFavorites(userId: string) {
  return prisma.favorite.findMany({
    where: { userId, listing: { status: ListingStatus.ACTIVE } },
    include: { listing: { include: publicInclude } },
    orderBy: { createdAt: "desc" },
  });
}

export async function isFavorited(userId: string, listingId: string) {
  const row = await prisma.favorite.findUnique({
    where: { userId_listingId: { userId, listingId } },
  });
  return !!row;
}
