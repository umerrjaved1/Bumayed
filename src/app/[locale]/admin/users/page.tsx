import { setRequestLocale } from "next-intl/server";
import { requireAdminPage } from "@/lib/admin-guard";
import { UsersTable, mapUserRow } from "@/components/admin/users-table";
import { can } from "@/modules/admin/policies";
import { searchAdminUsers } from "@/modules/admin/service";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireAdminPage(locale, "admin.users.view");
  const user = { id: session.user.id, role: session.user.role };
  const rows = await searchAdminUsers(user, {});

  return (
    <UsersTable
      canSuspend={can(user, "admin.users.suspend")}
      initialItems={rows.map((row) =>
        mapUserRow(row as unknown as Record<string, unknown>),
      )}
    />
  );
}
