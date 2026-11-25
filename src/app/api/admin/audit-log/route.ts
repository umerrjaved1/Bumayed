import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth-session";
import { adminErrorResponse } from "@/modules/admin/http";
import { getAuditLog } from "@/modules/admin/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireSessionUser();
    const items = await getAuditLog(user);
    return NextResponse.json({ items });
  } catch (err) {
    return adminErrorResponse(err, "Failed to load audit log");
  }
}
