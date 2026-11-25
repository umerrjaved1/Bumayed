"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { AdminCapability } from "@/modules/admin/policies";
import { can } from "@/modules/admin/policies";
import type { Role } from "@/generated/prisma/client";

type NavItem = {
  href: string;
  labelKey: string;
  capability: AdminCapability;
};

const ITEMS: NavItem[] = [
  { href: "/admin", labelKey: "navDashboard", capability: "admin.dashboard" },
  {
    href: "/admin/listings",
    labelKey: "navListings",
    capability: "admin.listings.moderate",
  },
  {
    href: "/admin/reports",
    labelKey: "navReports",
    capability: "admin.reports.resolve",
  },
  { href: "/admin/users", labelKey: "navUsers", capability: "admin.users.view" },
  {
    href: "/admin/dealers",
    labelKey: "navDealers",
    capability: "admin.dealers.view",
  },
  {
    href: "/admin/catalog",
    labelKey: "navCatalog",
    capability: "admin.catalog.manage",
  },
  {
    href: "/admin/locations",
    labelKey: "navLocations",
    capability: "admin.locations.manage",
  },
  {
    href: "/admin/commercial",
    labelKey: "navCommercial",
    capability: "admin.commercial.manage",
  },
  {
    href: "/admin/content",
    labelKey: "navContent",
    capability: "admin.content.manage",
  },
  {
    href: "/admin/admins",
    labelKey: "navAdmins",
    capability: "admin.admins.manage",
  },
  {
    href: "/admin/audit-log",
    labelKey: "navAudit",
    capability: "admin.audit.view",
  },
];

export function AdminNav({ role, userId }: { role: Role; userId: string }) {
  const t = useTranslations("admin");
  const pathname = usePathname();
  const user = { id: userId, role };

  return (
    <nav
      aria-label={t("navLabel")}
      className="flex flex-wrap gap-1 border-b pb-3"
    >
      {ITEMS.filter((item) => can(user, item.capability)).map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
