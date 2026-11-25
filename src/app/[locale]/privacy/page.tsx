import { setRequestLocale, getTranslations } from "next-intl/server";
import { ContentPage } from "@/components/shared/content-page";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("content.privacy");

  return (
    <ContentPage namespace="privacy">
      <div className="space-y-4 leading-relaxed text-muted-foreground">
        <p>{t("p1")}</p>
        <p>{t("p2")}</p>
      </div>
    </ContentPage>
  );
}
