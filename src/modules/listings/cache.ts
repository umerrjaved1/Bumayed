import { unstable_cache } from "next/cache";
import * as repo from "./repository";
import { toPublicDto } from "./mappers";
import { parseListingQuery } from "./query";
import type { GccCode } from "@/lib/gcc";
import type { ListingPublicDto, VehicleCategoryCode } from "./types";
import { CATALOG_TAG, PUBLIC_LISTINGS_TAG } from "./invalidate";

export { invalidateCatalog, invalidatePublicListings } from "./invalidate";

/**
 * Short-lived cache for the public, non-personal listing reads that every
 * visitor triggers (homepage rows, counts, make lists). The database sits
 * far from most visitors, so serving these from cache removes several round
 * trips per page view. Data refreshes at least every 60 seconds and right
 * away when an ad changes (see `invalidatePublicListings`).
 */

const CATEGORIES: VehicleCategoryCode[] = [
  "cars",
  "motorcycles",
  "boats",
  "plates",
];

export type HomeData = {
  featured: ListingPublicDto[];
  latest: ListingPublicDto[];
  popularMakes: string[];
  counts: Record<VehicleCategoryCode, number>;
};

/**
 * Homepage rows for one country ("all" = the whole GCC). The cache is keyed by
 * the country argument, so each country has its own entry.
 */
const homeDataForCountry = unstable_cache(
  async (country: string): Promise<HomeData> => {
    const only = country === "all" ? undefined : country;
    const [featuredRows, latestRows, popularMakes, ...counts] =
      await Promise.all([
        repo.findFeatured(6, only),
        repo.findLatest(12, only),
        // Only makes with live ads, so no chip leads to an empty results page.
        repo.findMakesWithActiveListings("cars", only),
        ...CATEGORIES.map((c) =>
          repo.countListings(
            parseListingQuery({}, c, only as GccCode | undefined),
          ),
        ),
      ]);
    const featured = featuredRows.map(toPublicDto);
    // Featured ads already have their own row; don't show them twice.
    const featuredSlugs = new Set(featured.map((l) => l.slug));
    const latest = latestRows
      .map(toPublicDto)
      .filter((l) => !featuredSlugs.has(l.slug))
      .slice(0, 6);
    return {
      featured,
      latest,
      popularMakes,
      counts: {
        cars: counts[0] ?? 0,
        motorcycles: counts[1] ?? 0,
        boats: counts[2] ?? 0,
        plates: counts[3] ?? 0,
      },
    };
  },
  // v3: ads now carry price/currency/country; older cached rows lack them.
  ["home-data-v3"],
  { revalidate: 60, tags: [PUBLIC_LISTINGS_TAG] },
);

/** Homepage data for a country, or for the whole GCC when `country` is undefined. */
export function getHomeData(country?: GccCode): Promise<HomeData> {
  return homeDataForCountry(country ?? "all");
}

/** Makes for the filter dropdowns: catalog data that rarely changes. */
export const getCachedMakesForCategory = unstable_cache(
  async (category: VehicleCategoryCode) => repo.findMakesForCategory(category),
  ["makes-for-category-v1"],
  { revalidate: 600, tags: [CATALOG_TAG] },
);
