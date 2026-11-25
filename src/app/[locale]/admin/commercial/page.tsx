import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireAdminPage } from "@/lib/admin-guard";
import { getCommercial } from "@/modules/admin/service";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminCommercialPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireAdminPage(locale, "admin.commercial.manage");
  const t = await getTranslations("admin");
  const { packages, promotionPrices } = await getCommercial({
    id: session.user.id,
    role: session.user.role,
  });

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold">{t("packages")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("packagesHint")}
        </p>
        <ul className="mt-3 divide-y rounded-lg border">
          {packages.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
            >
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-muted-foreground">
                  {p.validityDays} days · featured slots {p.featuredSlots}
                  {p.monthlyListingQuota == null
                    ? " · unlimited listings"
                    : ` · quota ${p.monthlyListingQuota}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  AED {p.priceAed.toLocaleString()}
                </span>
                <Badge variant={p.isActive ? "default" : "secondary"}>
                  {p.isActive ? t("active") : t("inactive")}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">{t("promotionPrices")}</h2>
        <ul className="mt-3 divide-y rounded-lg border">
          {promotionPrices.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between px-4 py-3 text-sm"
            >
              <span>
                {p.type} · {p.durationDays} days
              </span>
              <span className="font-medium">
                AED {p.priceAed.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
