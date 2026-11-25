import { setRequestLocale } from "next-intl/server";
import { ListingStatus } from "@/generated/prisma/client";
import { requireAdminPage } from "@/lib/admin-guard";
import { ModerationQueue } from "@/components/admin/moderation-queue";
import { mapListingRow } from "@/components/admin/row-mappers";
import { listAdminListings } from "@/modules/admin/service";

export const dynamic = "force-dynamic";

export default async function AdminListingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const session = await requireAdminPage(locale, "admin.listings.moderate");

  const statusRaw = sp.status;
  const status =
    statusRaw &&
    Object.values(ListingStatus).includes(statusRaw as ListingStatus)
      ? (statusRaw as ListingStatus)
      : ListingStatus.PENDING;

  const rows = await listAdminListings(
    { id: session.user.id, role: session.user.role },
    { status },
  );

  return (
    <ModerationQueue
      initialStatus={status}
      initialItems={rows.map((row) =>
        mapListingRow(row as unknown as Record<string, unknown>),
      )}
    />
  );
}
