import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { localizedPath } from "@/lib/seo";

export const dynamic = "force-dynamic";

const STATIC_PATHS = [
  "/",
  "/cars",
  "/motorcycles",
  "/boats",
  "/plates",
  "/about",
  "/faq",
  "/terms",
  "/privacy",
  "/contact",
];

/** Active listings only. Drafts, pending, and private areas stay out. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listings = await prisma.listing.findMany({
    // Only countries that are switched on: nothing is advertised before launch.
    where: { status: "ACTIVE", emirate: { country: { isActive: true } } },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 5000,
  });

  const entries: MetadataRoute.Sitemap = [];
  for (const path of STATIC_PATHS) {
    entries.push({
      url: localizedPath("en", path),
      alternates: {
        languages: {
          en: localizedPath("en", path),
          ar: localizedPath("ar", path),
        },
      },
    });
    entries.push({
      url: localizedPath("ar", path),
      alternates: {
        languages: {
          en: localizedPath("en", path),
          ar: localizedPath("ar", path),
        },
      },
    });
  }

  for (const listing of listings) {
    const path = `/listings/${listing.slug}`;
    for (const locale of ["en", "ar"] as const) {
      entries.push({
        url: localizedPath(locale, path),
        lastModified: listing.updatedAt,
      });
    }
  }

  return entries;
}
