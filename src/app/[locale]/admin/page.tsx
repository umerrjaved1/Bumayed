import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireAdminPage } from "@/lib/admin-guard";
import { getAdminDashboard } from "@/modules/admin/service";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireAdminPage(locale, "admin.dashboard");
  const t = await getTranslations("admin");
  const counts = await getAdminDashboard({
    id: session.user.id,
    role: session.user.role,
  });

  const tiles = [
    { key: "users", value: counts.users, href: "/admin/users" },
    { key: "dealers", value: counts.dealers, href: "/admin/dealers" },
    { key: "listings", value: counts.listings, href: "/admin/listings" },
    {
      key: "activeListings",
      value: counts.activeListings,
      href: "/admin/listings?status=ACTIVE",
    },
    {
      key: "pending",
      value: counts.pendingApprovals,
      href: "/admin/listings?status=PENDING",
    },
    {
      key: "reports",
      value: counts.reports,
      href: "/admin/reports?status=OPEN",
    },
    {
      key: "expired",
      value: counts.expiredListings,
      href: "/admin/listings?status=EXPIRED",
    },
    { key: "revenue", value: counts.revenueAed, href: "/admin/commercial" },
  ] as const;

  return (
    <div>
      <h2 className="sr-only">{t("dashboardHeading")}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <Link
            key={tile.key}
            href={tile.href}
            className="rounded-lg border bg-background/60 p-4 transition-colors hover:border-primary/40"
          >
            <p className="text-sm text-muted-foreground">{t(`stats.${tile.key}`)}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {tile.key === "revenue"
                ? `AED ${tile.value.toLocaleString()}`
                : tile.value.toLocaleString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
