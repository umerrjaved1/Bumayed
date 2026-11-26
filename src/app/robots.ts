import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  const hidden = ["dashboard", "admin", "auth", "checkout"].flatMap((area) => [
    `/en/${area}`,
    `/ar/${area}`,
  ]);
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", ...hidden],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
