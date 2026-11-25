import { setRequestLocale } from "next-intl/server";
import { requireAdminPage } from "@/lib/admin-guard";
import { DealersTable } from "@/components/admin/dealers-table";
import { mapDealerRow } from "@/components/admin/row-mappers";
import { can } from "@/modules/admin/policies";
import { listAdminDealers } from "@/modules/admin/service";

export const dynamic = "force-dynamic";

export default async function AdminDealersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireAdminPage(locale, "admin.dealers.view");
  const user = { id: session.user.id, role: session.user.role };
  const rows = await listAdminDealers(user);

  return (
    <DealersTable
      canVerify={can(user, "admin.dealers.verify")}
      initialItems={rows.map((row) =>
        mapDealerRow(row as unknown as Record<string, unknown>),
      )}
    />
  );
}
