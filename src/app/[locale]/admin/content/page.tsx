import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireAdminPage } from "@/lib/admin-guard";
import { getContent } from "@/modules/admin/service";
import { Badge } from "@/components/ui/badge";
import { ContentEditor } from "@/components/admin/content-editor";

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
      <ContentEditor
        pages={pages.map((p) => ({
          slug: p.slug,
          status: p.status,
          titleEn: p.titleEn,
          titleAr: p.titleAr,
          bodyEn: p.bodyEn,
          bodyAr: p.bodyAr,
        }))}
      />
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
