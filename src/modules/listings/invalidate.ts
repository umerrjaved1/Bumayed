import { revalidateTag } from "next/cache";

/** Cache tags for public listing reads (see cache.ts). */
export const PUBLIC_LISTINGS_TAG = "public-listings";
export const CATALOG_TAG = "catalog";

/**
 * Mark cached public listing data stale after an ad changes. Safe to call
 * from anywhere: outside a request (scripts, tests) it quietly does nothing,
 * and the 60-second revalidate still bounds staleness.
 */
export function invalidatePublicListings() {
  try {
    revalidateTag(PUBLIC_LISTINGS_TAG, { expire: 0 });
  } catch {
    /* not in a Next.js request context */
  }
}

/** Clear cached make/model lists after an admin edits the catalog. */
export function invalidateCatalog() {
  try {
    revalidateTag(CATALOG_TAG, { expire: 0 });
  } catch {
    /* not in a Next.js request context */
  }
}
