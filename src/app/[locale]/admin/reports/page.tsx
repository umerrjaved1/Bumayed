import { setRequestLocale } from "next-intl/server";
import { ReportStatus } from "@/generated/prisma/client";
import { requireAdminPage } from "@/lib/admin-guard";
import { ReportsQueue, mapReportRow } from "@/components/admin/reports-queue";
import { listAdminReports } from "@/modules/admin/service";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireAdminPage(locale, "admin.reports.resolve");
  const rows = await listAdminReports(
    { id: session.user.id, role: session.user.role },
    ReportStatus.OPEN,
  );

  return (
    <ReportsQueue
      initialItems={rows.map((row) =>
        mapReportRow(row as unknown as Record<string, unknown>),
      )}
    />
  );
}
