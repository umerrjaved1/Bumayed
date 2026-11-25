import {
  type ListingQuery,
  type ListingSort,
  type SearchParamsInput,
  type VehicleCategoryCode,
} from "./types";

const SORTS: ListingSort[] = [
  "newest",
  "priceAsc",
  "priceDesc",
  "mileageAsc",
  "yearDesc",
];

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
