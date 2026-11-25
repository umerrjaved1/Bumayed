import { NextResponse } from "next/server";
import { DealerVerificationStatus } from "@/generated/prisma/client";
import { requireSessionUser } from "@/lib/auth-session";
import { adminErrorResponse } from "@/modules/admin/http";
import { listAdminDealers } from "@/modules/admin/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await requireSessionUser();
    const statusRaw = new URL(request.url).searchParams.get("status");
    const status =
      statusRaw &&
      Object.values(DealerVerificationStatus).includes(
        statusRaw as DealerVerificationStatus,
      )
        ? (statusRaw as DealerVerificationStatus)
        : undefined;
    const items = await listAdminDealers(user, status);
    return NextResponse.json({ items });
  } catch (err) {
    return adminErrorResponse(err, "Failed to load dealers");
  }
}
