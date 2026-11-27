import { gccByCode, type GccCode } from "@/lib/gcc";
import { PLATE_CODE_RE, PLATE_DIGIT_COUNTS, PLATE_EMIRATES, PLATE_TYPES } from "./plates";
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
  // Database columns are 32-bit integers, so drop fractions and out-of-range
  // values instead of letting Prisma throw a 500.
  if (!Number.isFinite(n)) return undefined;
  const i = Math.trunc(n);
  return Math.abs(i) <= 2_147_483_647 ? i : undefined;
}

/** A min above the max is almost always a typo, so swap rather than return nothing. */
function ordered(
  min: number | undefined,
  max: number | undefined,
): [number | undefined, number | undefined] {
  return min != null && max != null && min > max ? [max, min] : [min, max];
}

/**
 * ?country=SA browses Saudi ads, ?country=all browses the whole GCC, and a
 * missing or unknown value falls back to the visitor's saved country.
 */
export function parseCountry(
  raw: string | string[] | undefined,
  fallback?: GccCode,
): GccCode | undefined {
  const v = str(raw)?.toLowerCase();
  if (v === "all") return undefined;
  const country = gccByCode(v);
  return country ? country.code : fallback;
}

/** Parse raw URL search params into a typed query (invalid values dropped). */
export function parseListingQuery(
  searchParams: SearchParamsInput,
  category: VehicleCategoryCode,
  /** Country to browse when the URL does not say (the visitor's saved country). */
  defaultCountry?: GccCode,
): ListingQuery {
  const country = parseCountry(searchParams.country, defaultCountry);
  const rawSort = str(searchParams.sort) as ListingSort | undefined;
  const condition = str(searchParams.condition);
  const sellerType = str(searchParams.sellerType);
  const [priceMin, priceMax] = ordered(
    num(searchParams.priceMin),
    num(searchParams.priceMax),
  );
  const [yearMin, yearMax] = ordered(
    num(searchParams.yearMin),
    num(searchParams.yearMax),
  );
  const plateEmirate = str(searchParams.plateEmirate)?.toUpperCase();
  const plateType = str(searchParams.plateType)?.toLowerCase();
  const plateDigits = str(searchParams.plateDigits);
  const plateCode = str(searchParams.plateCode)?.toUpperCase();
  return {
    category,
    keyword: str(searchParams.keyword),
    make: str(searchParams.make),
    priceMin,
    priceMax,
    yearMin,
    yearMax,
    mileageMax: num(searchParams.mileageMax),
    country,
    // Prices are typed in the browsed country's currency, or AED when browsing the whole GCC.
    currency: country ? gccByCode(country)!.currency : "AED",
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
    plateEmirate: (PLATE_EMIRATES as readonly string[]).includes(plateEmirate ?? "")
      ? plateEmirate
      : undefined,
    plateType: (PLATE_TYPES as readonly string[]).includes(plateType ?? "")
      ? plateType
      : undefined,
    plateDigits: (PLATE_DIGIT_COUNTS as readonly string[]).includes(plateDigits ?? "")
      ? plateDigits
      : undefined,
    plateCode: plateCode && PLATE_CODE_RE.test(plateCode) ? plateCode : undefined,
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
