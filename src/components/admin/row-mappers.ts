// Pure row mappers shared by admin server pages and client tables.
// Kept out of "use client" files so server components can call them.

export type AdminUserRow = {
  id: string;
  email: string | null;
  phone: string | null;
  role: string;
  status: string;
  displayName: string;
  listingsCount: number;
};

export function mapUserRow(row: Record<string, unknown>): AdminUserRow {
  const profile = row.profile as { displayName?: string } | null | undefined;
  const count = row._count as { listings?: number } | undefined;
  return {
    id: String(row.id),
    email: (row.email as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    role: String(row.role),
    status: String(row.status),
    displayName: profile?.displayName ?? (row.email as string) ?? "—",
    listingsCount: count?.listings ?? 0,
  };
}

export type AdminListingRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  priceAed: number;
  submittedAt: string | null;
  rejectionReason: string | null;
  sellerName: string;
  category: string;
  location: string;
  imageUrl: string | null;
  openReports: number;
};

export function mapListingRow(row: Record<string, unknown>): AdminListingRow {
  const seller = row.seller as
    | {
        profile?: { displayName?: string } | null;
        dealerProfile?: { businessName?: string } | null;
        email?: string | null;
      }
    | undefined;
  const category = row.category as { nameEn?: string } | undefined;
  const emirate = row.emirate as { nameEn?: string } | undefined;
  const city = row.city as { nameEn?: string } | undefined;
  const images = row.images as Array<{ objectKey?: string }> | undefined;
  const reports = row.reports as unknown[] | undefined;

  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    status: String(row.status),
    priceAed: Number(row.priceAed),
    submittedAt: row.submittedAt
      ? new Date(String(row.submittedAt)).toISOString()
      : null,
    rejectionReason: (row.rejectionReason as string | null) ?? null,
    sellerName:
      seller?.dealerProfile?.businessName ??
      seller?.profile?.displayName ??
      seller?.email ??
      "—",
    category: category?.nameEn ?? "—",
    location: [city?.nameEn, emirate?.nameEn].filter(Boolean).join(", "),
    imageUrl: images?.[0]?.objectKey ? `/uploads/${images[0].objectKey}` : null,
    openReports: reports?.length ?? 0,
  };
}

export type AdminDealerRow = {
  id: string;
  businessName: string;
  status: string;
  email: string | null;
  phone: string;
  location: string;
  note: string | null;
};

export function mapDealerRow(row: Record<string, unknown>): AdminDealerRow {
  const user = row.user as
    { email?: string | null; phone?: string | null } | undefined;
  const emirate = row.emirate as { nameEn?: string } | null | undefined;
  const city = row.city as { nameEn?: string } | null | undefined;
  return {
    id: String(row.id),
    businessName: String(row.businessName),
    status: String(row.verificationStatus),
    email: (row.businessEmail as string | null) ?? user?.email ?? null,
    phone: String(row.businessPhone ?? user?.phone ?? ""),
    location: [city?.nameEn, emirate?.nameEn].filter(Boolean).join(", "),
    note: (row.verificationNote as string | null) ?? null,
  };
}
