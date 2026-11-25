import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

/** Stub until Phase 5 listing wizard. */
export default async function NewListingStubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/auth/login`);

  const t = await getTranslations("dashboard");

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">{t("postAd")}</h1>
      <p className="mt-3 text-muted-foreground">{t("listingsSoon")}</p>
      <Button className="mt-8" render={<Link href="/dashboard" />}>
        {t("title")}
      </Button>
    </div>
  );
}
