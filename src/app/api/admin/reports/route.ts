import { NextResponse } from "next/server";
import { ReportStatus } from "@/generated/prisma/client";
import { requireSessionUser } from "@/lib/auth-session";
import { adminErrorResponse } from "@/modules/admin/http";
import { listAdminReports } from "@/modules/admin/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await requireSessionUser();
    const statusRaw = new URL(request.url).searchParams.get("status");
    const status =
      statusRaw &&
      Object.values(ReportStatus).includes(statusRaw as ReportStatus)
        ? (statusRaw as ReportStatus)
        : undefined;
    const items = await listAdminReports(user, status);
    return NextResponse.json({ items });
  } catch (err) {
    return adminErrorResponse(err, "Failed to load reports");
  }
}
