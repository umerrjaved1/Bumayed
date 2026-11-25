import { NextResponse } from "next/server";
import { ListingStatus } from "@/generated/prisma/client";
import { requireSessionUser } from "@/lib/auth-session";
import { adminErrorResponse } from "@/modules/admin/http";
import { listAdminListings } from "@/modules/admin/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await requireSessionUser();
    const sp = new URL(request.url).searchParams;
    const statusRaw = sp.get("status");
    const status =
      statusRaw && Object.values(ListingStatus).includes(statusRaw as ListingStatus)
        ? (statusRaw as ListingStatus)
        : undefined;
    const q = sp.get("q") ?? undefined;
    const items = await listAdminListings(user, { status, q });
    return NextResponse.json({ items });
  } catch (err) {
    return adminErrorResponse(err, "Failed to load admin listings");
  }
}
