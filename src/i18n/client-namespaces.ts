/**
 * Translation sections that client components read. Only these are sent to
 * the browser; server-only copy (homepage, content pages, SEO, footer…) stays
 * on the server instead of being shipped on every page.
 *
 * A client component that uses a section missing from this list shows raw
 * keys like "plates.searchNumber". `client-namespaces.test.ts` fails when
 * that happens, so add the section here.
 */
export const CLIENT_NAMESPACES = [
  "common",
  "country",
  "nav",
  "listing",
  "emirates",
  "filters",
  "sort",
  "detail",
  "favorites",
  "errors",
  "auth",
  "tabBar",
  "dashboard",
  "wizard",
  "sellerListings",
  "dealerDashboard",
  "admin",
  "checkout",
  "packages",
  "promote",
  "plates",
] as const;
