import { unstable_cache } from "next/cache";
import * as repo from "./repository";
import { toPublicDto } from "./mappers";
import { parseListingQuery } from "./query";
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

const CATEGORIES: VehicleCategoryCode[] = ["cars", "motorcycles", "boats"];

export type HomeData = {
  featured: ListingPublicDto[];
  latest: ListingPublicDto[];
  popularMakes: string[];
  counts: Record<VehicleCategoryCode, number>;
};

export const getHomeData = unstable_cache(
  async (): Promise<HomeData> => {
    const [featuredRows, latestRows, popularMakes, ...counts] =
      await Promise.all([
        repo.findFeatured(6),
        repo.findLatest(12),
        // Only makes with live ads, so no chip leads to an empty results page.
        repo.findMakesWithActiveListings("cars"),
        ...CATEGORIES.map((c) =>
          repo.countListings(parseListingQuery({}, c)),
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
      },
    };
  },
  ["home-data-v1"],
  { revalidate: 60, tags: [PUBLIC_LISTINGS_TAG] },
);

/** Makes for the filter dropdowns: catalog data that rarely changes. */
export const getCachedMakesForCategory = unstable_cache(
  async (category: VehicleCategoryCode) => repo.findMakesForCategory(category),
  ["makes-for-category-v1"],
  { revalidate: 600, tags: [CATALOG_TAG] },
);
