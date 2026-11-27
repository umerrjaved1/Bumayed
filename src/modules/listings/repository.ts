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
import { keywordTerms, termVariants } from "./keyword";
import { invalidatePublicListings } from "./invalidate";
import { rangeToAed } from "@/lib/currency";

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

/**
 * One condition per keyword word: each word (or one of its spelling variants)
 * must appear in the title, description, or the make/model name in English
 * or Arabic. So "land cruiser", "G63" and "تويوتا" all find their ads.
 */
function keywordWhere(keyword: string): Prisma.ListingWhereInput[] {
  return keywordTerms(keyword).map((term) => ({
    OR: termVariants(term).flatMap((v) => [
      { title: { contains: v, mode: "insensitive" as const } },
      { description: { contains: v, mode: "insensitive" as const } },
      { make: { nameEn: { contains: v, mode: "insensitive" as const } } },
      { make: { nameAr: { contains: v, mode: "insensitive" as const } } },
      { model: { nameEn: { contains: v, mode: "insensitive" as const } } },
      { model: { nameAr: { contains: v, mode: "insensitive" as const } } },
      // Number plates: "1234" finds the plate even if the title was edited.
      { specs: { path: ["plateNumber"], string_contains: v } },
      { specs: { path: ["plateCode"], equals: v.toUpperCase() } },
    ]),
  }));
}

/**
 * Public pages only show ads from countries that are switched on, so adding a
 * country's data (or dev sample ads) never exposes it before launch.
 */
const IN_ACTIVE_COUNTRY = { emirate: { country: { isActive: true } } } as const;

/** Build Prisma where for server-side filters (playbook §7.3). */
export function buildSearchWhere(q: ListingQuery): Prisma.ListingWhereInput {
  const and: Prisma.ListingWhereInput[] = [
    { status: ListingStatus.ACTIVE },
    IN_ACTIVE_COUNTRY,
    { category: { code: CATEGORY_CODE_TO_ENUM[q.category] } },
  ];

  if (q.keyword) and.push(...keywordWhere(q.keyword));
  if (q.make) {
    and.push({ make: { nameEn: { equals: q.make, mode: "insensitive" } } });
  }
  if (q.country) and.push({ countryCode: q.country });
  if (q.priceMin != null || q.priceMax != null) {
    // Typed in the browsed currency; compared on the AED equivalent so every
    // country's ads can be filtered and sorted together.
    const aed = rangeToAed({ min: q.priceMin, max: q.priceMax }, q.currency);
    if (aed.min != null) and.push({ priceAed: { gte: aed.min } });
    if (aed.max != null) and.push({ priceAed: { lte: aed.max } });
  }
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
    // Older wizard ads stored condition in lowercase, so match both.
    and.push({
      OR: [
        { specs: { path: ["condition"], equals: upper(q.condition) } },
        { specs: { path: ["condition"], equals: q.condition.toLowerCase() } },
      ],
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

  if (q.plateEmirate) {
    and.push({ specs: { path: ["plateEmirate"], equals: q.plateEmirate } });
  }
  if (q.plateType) {
    and.push({ specs: { path: ["plateType"], equals: q.plateType } });
  }
  if (q.plateCode) {
    and.push({ specs: { path: ["plateCode"], equals: q.plateCode } });
  }
  if (q.plateDigits) {
    // Digit count = length of the stored number, so match the number's shape.
    and.push({ specs: { path: ["plateDigits"], equals: Number(q.plateDigits) } });
  }

  return { AND: and };
}

export async function searchListings(q: ListingQuery) {
  const where = buildSearchWhere(q);
  const findPage = (page: number) =>
    prisma.listing.findMany({
      where,
      include: publicInclude,
      orderBy: sortToOrderBy(q.sort),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });

  // Count and fetch in parallel: one database round trip instead of two.
  const [total, firstTry] = await Promise.all([
    prisma.listing.count({ where }),
    findPage(q.page),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(q.page, totalPages);
  // Rare: a page number past the end. Fetch the real last page instead.
  const rows = page === q.page ? firstTry : await findPage(page);

  return { rows, total, page, totalPages };
}

/** Number of ads matching a query, without loading any of them. */
export async function countListings(q: ListingQuery) {
  return prisma.listing.count({ where: buildSearchWhere(q) });
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

export async function findFeatured(limit = 6, country?: string) {
  return prisma.listing.findMany({
    where: {
      status: ListingStatus.ACTIVE,
      ...IN_ACTIVE_COUNTRY,
      ...(country ? { countryCode: country } : {}),
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

export async function findLatest(limit = 6, country?: string) {
  return prisma.listing.findMany({
    where: {
      status: ListingStatus.ACTIVE,
      ...IN_ACTIVE_COUNTRY,
      ...(country ? { countryCode: country } : {}),
    },
    include: publicInclude,
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    take: limit,
  });
}

export async function findSimilar(
  category: VehicleCategoryCode,
  excludeSlug: string,
  limit = 3,
  country?: string,
) {
  return prisma.listing.findMany({
    where: {
      status: ListingStatus.ACTIVE,
      slug: { not: excludeSlug },
      ...IN_ACTIVE_COUNTRY,
      ...(country ? { countryCode: country } : {}),
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

/** Makes that have at least one live ad, so links never lead to an empty page. */
export async function findMakesWithActiveListings(
  category: VehicleCategoryCode,
  country?: string,
) {
  const rows = await prisma.vehicleMake.findMany({
    where: {
      isActive: true,
      category: { code: CATEGORY_CODE_TO_ENUM[category] },
      listings: {
        some: {
          status: ListingStatus.ACTIVE,
          ...IN_ACTIVE_COUNTRY,
          ...(country ? { countryCode: country } : {}),
        },
      },
    },
    orderBy: { nameEn: "asc" },
    select: { nameEn: true },
  });
  return rows.map((r) => r.nameEn);
}

/** Live ads matching a keyword in each of the given categories. */
export async function countKeywordMatches(
  keyword: string,
  categories: VehicleCategoryCode[],
): Promise<{ category: VehicleCategoryCode; count: number }[]> {
  return Promise.all(
    categories.map(async (category) => ({
      category,
      count: await prisma.listing.count({
        where: {
          AND: [
            { status: ListingStatus.ACTIVE },
            { category: { code: CATEGORY_CODE_TO_ENUM[category] } },
            ...keywordWhere(keyword),
          ],
        },
      }),
    })),
  );
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function findListingById(id: string) {
  // The id column is a UUID; querying with a slug would make Postgres throw.
  if (!UUID_RE.test(id)) return null;
  return prisma.listing.findUnique({
    where: { id },
    include: publicInclude,
  });
}

export async function updateListingStatus(
  id: string,
  data: Prisma.ListingUpdateInput,
) {
  const result = await prisma.listing.update({ where: { id }, data, include: publicInclude });
  invalidatePublicListings();
  return result;
}

export async function findSellerListings(
  sellerId: string,
  status?: ListingStatus,
) {
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

export async function updateListing(
  id: string,
  data: Prisma.ListingUpdateInput,
) {
  const result = await prisma.listing.update({ where: { id }, data, include: publicInclude });
  invalidatePublicListings();
  return result;
}

export async function findCategoryByCode(code: VehicleCategoryCode) {
  return prisma.category.findUnique({
    where: { code: CATEGORY_CODE_TO_ENUM[code] },
  });
}

/** A region with its country, so callers know the currency and whether the country is open. */
export async function findEmirateByCode(code: string) {
  return prisma.emirate.findUnique({
    where: { code: code.toUpperCase() },
    include: { country: true },
  });
}

export async function cityBelongsToEmirate(cityId: string, emirateId: string) {
  const city = await prisma.city.findFirst({
    where: { id: cityId, emirateId },
    select: { id: true },
  });
  return !!city;
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
  const result = await prisma.listingImage.create({ data });
  invalidatePublicListings();
  return result;
}

export async function listListingImages(listingId: string) {
  return prisma.listingImage.findMany({
    where: { listingId },
    orderBy: { sortOrder: "asc" },
  });
}

export async function deleteListingImageRow(id: string) {
  const result = await prisma.listingImage.delete({ where: { id } });
  invalidatePublicListings();
  return result;
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
  const result = await prisma.listingVideo.upsert({
    where: { listingId: data.listingId },
    create: data,
    update: {
      provider: data.provider,
      originalUrl: data.originalUrl,
      embedUrl: data.embedUrl,
    },
  });
  invalidatePublicListings();
  return result;
}

export async function deleteListingVideo(listingId: string) {
  const result = await prisma.listingVideo.deleteMany({ where: { listingId } });
  invalidatePublicListings();
  return result;
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

/** Just the saved ad ids, for heart icons on listing cards. */
export async function listFavoriteIds(userId: string) {
  const rows = await prisma.favorite.findMany({
    where: { userId },
    select: { listingId: true },
  });
  return rows.map((r) => r.listingId);
}

export async function isFavorited(userId: string, listingId: string) {
  const row = await prisma.favorite.findUnique({
    where: { userId_listingId: { userId, listingId } },
  });
  return !!row;
}
