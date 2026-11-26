import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CategoryResults } from "@/components/shared/category-results";
import { publicMetadata } from "@/lib/seo";
import type { SearchParamsInput } from "@/modules/listings/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "categories" });
  return publicMetadata({
    locale,
    path: "/boats",
    title: t("boats"),
    description: t("boatsDescription"),
  });
}

export default async function BoatsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParamsInput>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CategoryResults category="boats" searchParams={await searchParams} />;
}
