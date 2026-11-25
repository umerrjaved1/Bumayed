import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireAdminPage } from "@/lib/admin-guard";
import { getContent } from "@/modules/admin/service";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireAdminPage(locale, "admin.content.manage");
  const t = await getTranslations("admin");
  const { pages, banners } = await getContent({
    id: session.user.id,
    role: session.user.role,
  });

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold">{t("contentPages")}</h2>
        <ul className="mt-3 divide-y rounded-lg border">
          {pages.map((p) => (
            <li key={p.id} className="px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{p.slug}</span>
                <Badge variant="secondary">{p.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {p.titleEn} / {p.titleAr}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">{t("banners")}</h2>
        {banners.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            {t("emptyBanners")}
          </p>
        ) : (
          <ul className="mt-3 divide-y rounded-lg border">
            {banners.map((b) => (
              <li key={b.id} className="px-4 py-3 text-sm">
                {b.titleEn} · {b.position}{" "}
                <Badge variant={b.isActive ? "default" : "secondary"}>
                  {b.isActive ? t("active") : t("inactive")}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
