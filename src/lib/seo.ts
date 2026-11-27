import type { Metadata } from "next";

const LOCALES = ["en", "ar"] as const;

export function siteUrl(): string {
  const raw = process.env.AUTH_URL || "https://bumayed.vercel.app";
  return raw.replace(/\/$/, "");
}

export function localizedPath(locale: string, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl()}/${locale}${clean === "/" ? "" : clean}`;
}

/** Public page metadata: unique title, canonical, Open Graph, en/ar alternates. */
export function publicMetadata(input: {
  locale: string;
  path: string;
  title: string;
  description: string;
  image?: string | null;
}): Metadata {
  const canonical = localizedPath(input.locale, input.path);
  const languages = Object.fromEntries(
    LOCALES.map((locale) => [locale, localizedPath(locale, input.path)]),
  );
  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical,
      languages: { ...languages, "x-default": localizedPath("en", input.path) },
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonical,
      siteName: "BuMayed",
      locale: input.locale === "ar" ? "ar_AE" : "en_AE",
      type: "website",
      images: input.image ? [{ url: input.image }] : undefined,
    },
  };
}

export const privateRobots: Metadata = {
  robots: { index: false, follow: false },
};
