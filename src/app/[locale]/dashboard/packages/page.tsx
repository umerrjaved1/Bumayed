import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { PackagesClient } from "@/components/payments/packages-client";
import { listActivePackages } from "@/modules/payments/service";

export const dynamic = "force-dynamic";

export default async function PackagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user)
    redirect(
      `/${locale}/auth/login?callbackUrl=${encodeURIComponent(`/${locale}/dashboard/packages`)}`,
    );
  if (session.user.role !== "DEALER" && session.user.role !== "SUPER_ADMIN") {
    redirect(`/${locale}/dashboard`);
  }
  const t = await getTranslations("packages");
  const packages = await listActivePackages();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      <div className="mt-8">
        <PackagesClient
          packages={packages.map((p) => ({
            id: p.id,
            name: p.name,
            nameAr: p.nameAr,
            priceAed: p.priceAed,
            validityDays: p.validityDays,
            featuredSlots: p.featuredSlots,
            monthlyListingQuota: p.monthlyListingQuota,
          }))}
        />
      </div>
    </div>
  );
}
