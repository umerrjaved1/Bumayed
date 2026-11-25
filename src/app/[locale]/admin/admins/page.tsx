import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireAdminPage } from "@/lib/admin-guard";
import { getAdmins } from "@/modules/admin/service";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminAdminsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireAdminPage(locale, "admin.admins.manage");
  const t = await getTranslations("admin");
  const items = await getAdmins({
    id: session.user.id,
    role: session.user.role,
  });

  return (
    <div>
      <h2 className="text-lg font-semibold">{t("adminsHeading")}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("adminsHint")}</p>
      <ul className="mt-4 divide-y rounded-lg border">
        {items.map((a) => (
          <li
            key={a.id}
            className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
          >
            <div>
              <p className="font-medium">
                {a.profile?.displayName ?? a.email ?? a.phone}
              </p>
              <p className="text-sm text-muted-foreground">{a.email}</p>
            </div>
            <Badge variant="secondary">{a.role}</Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}
