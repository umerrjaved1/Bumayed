import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ContentPage } from "@/components/shared/content-page";
import { publicMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "content.terms" });
  return publicMetadata({
    locale,
    path: "/terms",
    title: t("title"),
    description: t("p1"),
  });
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("content.terms");

  return (
    <ContentPage namespace="terms">
      <div className="space-y-4 leading-relaxed text-muted-foreground">
        <p>{t("p1")}</p>
        <p>{t("p2")}</p>
        <p>{t("p3")}</p>
      </div>
    </ContentPage>
  );
}
