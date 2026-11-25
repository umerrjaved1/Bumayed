import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireAdminPage } from "@/lib/admin-guard";
import { getLocations } from "@/modules/admin/service";

export const dynamic = "force-dynamic";

export default async function AdminLocationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireAdminPage(locale, "admin.locations.manage");
  const t = await getTranslations("admin");
  const emirates = await getLocations({
    id: session.user.id,
    role: session.user.role,
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t("locationsHeading")}</h2>
      <ul className="space-y-4">
        {emirates.map((e) => (
          <li key={e.id} className="rounded-lg border p-4">
            <p className="font-medium">
              {e.nameEn} / {e.nameAr}{" "}
              <span className="text-muted-foreground">({e.code})</span>
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {e.cities.map((c) => (
                <li key={c.id}>
                  {c.nameEn}
                  {c.areas.length > 0
                    ? ` — ${c.areas.map((a) => a.nameEn).join(", ")}`
                    : ""}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
