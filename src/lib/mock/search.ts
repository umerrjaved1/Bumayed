/**
 * ⚠️ MOCK SEARCH SERVICE — Phase 2 visual layer only.
 * Mirrors the contract of the real Phase 3 listings API: query params in,
 * server-side filter/sort/paginate out. Replaced by Prisma queries in
 * Phase 3 (playbook §7.3: never fetch-all-and-filter in the browser —
 * this mock at least keeps that discipline in shape).
 */
import {
  MOCK_LISTINGS,
  type MockListing,
  type VehicleCategoryCode,
} from "./listings";

export const PAGE_SIZE = 9;

export type ListingSort =
  | "newest"
  | "priceAsc"
  | "priceDesc"
  | "mileageAsc"
  | "yearDesc";

export type ListingQuery = {
  category: VehicleCategoryCode;
  keyword?: string;
  make?: string;
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  mileageMax?: number;
  emirate?: string;
  condition?: "new" | "used";
  sellerType?: "individual" | "dealer";
  transmission?: string;
  fuelType?: string;
  regionalSpec?: string;
  motoType?: string;
  boatType?: string;
  sort: ListingSort;
  page: number;
};

export type SearchParamsInput = Record<string, string | string[] | undefined>;

function str(v: string | string[] | undefined): string | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  return s && s.trim() !== "" ? s.trim() : undefined;
}

function num(v: string | string[] | undefined): number | undefined {
  const s = str(v);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

const SORTS: ListingSort[] = [
  "newest",
  "priceAsc",
  "priceDesc",
  "mileageAsc",
  "yearDesc",
];

/** Parse raw URL search params into a typed query (invalid values dropped). */
export function parseListingQuery(
  searchParams: SearchParamsInput,
  category: VehicleCategoryCode,
): ListingQuery {
  const rawSort = str(searchParams.sort) as ListingSort | undefined;
  const condition = str(searchParams.condition);
  const sellerType = str(searchParams.sellerType);
  return {
    category,
    keyword: str(searchParams.keyword),
    make: str(searchParams.make),
    priceMin: num(searchParams.priceMin),
    priceMax: num(searchParams.priceMax),
    yearMin: num(searchParams.yearMin),
    yearMax: num(searchParams.yearMax),
    mileageMax: num(searchParams.mileageMax),
    emirate: str(searchParams.emirate),
    condition:
      condition === "new" || condition === "used" ? condition : undefined,
    sellerType:
      sellerType === "individual" || sellerType === "dealer"
        ? sellerType
        : undefined,
    transmission: str(searchParams.transmission),
    fuelType: str(searchParams.fuelType),
    regionalSpec: str(searchParams.regionalSpec),
    motoType: str(searchParams.motoType),
    boatType: str(searchParams.boatType),
    sort: rawSort && SORTS.includes(rawSort) ? rawSort : "newest",
    page: Math.max(1, num(searchParams.page) ?? 1),
  };
}

function matches(l: MockListing, q: ListingQuery): boolean {
  if (l.category !== q.category) return false;
  if (q.keyword) {
    const k = q.keyword.toLowerCase();
    const hay = `${l.title} ${l.make} ${l.model} ${l.trim ?? ""}`.toLowerCase();
    if (!hay.includes(k)) return false;
  }
  if (q.make && l.make !== q.make) return false;
  if (q.priceMin != null && l.priceAed < q.priceMin) return false;
  if (q.priceMax != null && l.priceAed > q.priceMax) return false;
  if (q.yearMin != null && l.year < q.yearMin) return false;
  if (q.yearMax != null && l.year > q.yearMax) return false;
  if (q.mileageMax != null && (l.mileageKm ?? 0) > q.mileageMax) return false;
  if (q.emirate && l.emirate !== q.emirate) return false;
  if (q.condition && l.condition !== q.condition) return false;
  if (q.sellerType && l.seller.type !== q.sellerType) return false;
  if (q.transmission && l.transmission !== q.transmission) return false;
  if (q.fuelType && l.fuelType !== q.fuelType) return false;
  if (q.regionalSpec && l.regionalSpec !== q.regionalSpec) return false;
  if (q.motoType && l.motoType !== q.motoType) return false;
  if (q.boatType && l.boatType !== q.boatType) return false;
  return true;
}

function sortListings(items: MockListing[], sort: ListingSort) {
  const arr = [...items];
  switch (sort) {
    case "priceAsc":
      return arr.sort((a, b) => a.priceAed - b.priceAed);
    case "priceDesc":
      return arr.sort((a, b) => b.priceAed - a.priceAed);
    case "mileageAsc":
      return arr.sort((a, b) => (a.mileageKm ?? 0) - (b.mileageKm ?? 0));
    case "yearDesc":
      return arr.sort((a, b) => b.year - a.year);
    default:
      return arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export function searchMockListings(q: ListingQuery) {
  const filtered = MOCK_LISTINGS.filter((l) => matches(l, q));
  const sorted = sortListings(filtered, q.sort);
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(q.page, totalPages);
  const items = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return { items, total, page, totalPages };
}

/** Build a query string merging current params with overrides (drops empties). */
export function buildQueryString(
  current: SearchParamsInput,
  overrides: Record<string, string | number | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(current)) {
    const v = str(value);
    if (v) params.set(key, v);
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined || value === "") params.delete(key);
    else params.set(key, String(value));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}
