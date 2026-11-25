import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireAdminPage } from "@/lib/admin-guard";
import { AdminNav } from "@/components/admin/admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout(
  props: LayoutProps<"/[locale]/admin">,
) {
  const { children } = props;
  const { locale } = await props.params;
  setRequestLocale(locale);
  const session = await requireAdminPage(locale);
  const t = await getTranslations("admin");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-medium text-primary">{t("eyebrow")}</p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
      <AdminNav role={session.user.role} userId={session.user.id} />
      <div className="mt-6">{children}</div>
    </div>
  );
}
