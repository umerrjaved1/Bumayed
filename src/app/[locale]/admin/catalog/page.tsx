import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireAdminPage } from "@/lib/admin-guard";
import { getCatalog } from "@/modules/admin/service";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminCatalogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireAdminPage(locale, "admin.catalog.manage");
  const t = await getTranslations("admin");
  const { categories, makes } = await getCatalog({
    id: session.user.id,
    role: session.user.role,
  });

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold">{t("categories")}</h2>
        <ul className="mt-3 divide-y rounded-lg border">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
            >
              <div>
                <p className="font-medium">
                  {c.nameEn}
                  {c.nameAr ? ` / ${c.nameAr}` : ""}
                </p>
                <p className="text-sm text-muted-foreground">{c.code}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary">
                  {t("makesCount", { count: c._count.makes })}
                </Badge>
                <Badge variant="outline">
                  {t("listingsCountBadge", { count: c._count.listings })}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">{t("makes")}</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {makes.map((m) => (
            <li key={m.id} className="rounded-lg border px-3 py-2 text-sm">
              <span className="font-medium">{m.nameEn}</span>
              <span className="text-muted-foreground">
                {" "}
                · {m.category.nameEn} · {m._count.models} models
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
