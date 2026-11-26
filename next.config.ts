import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  serverExternalPackages: ["@aws-sdk/client-s3"],
  images: {
    // Listing photos: seed photos are local, uploads come from the public R2 bucket.
    remotePatterns: [{ protocol: "https", hostname: "*.r2.dev" }],
    formats: ["image/avif", "image/webp"],
  },
  // cacheComponents/partialPrefetching intentionally left OFF for the MVP
  // (playbook rule 13: boring, proven solutions; revisit before production).
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withNextIntl(nextConfig);
