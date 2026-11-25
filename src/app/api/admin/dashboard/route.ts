import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth-session";
import { adminErrorResponse } from "@/modules/admin/http";
import { getAdminDashboard } from "@/modules/admin/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireSessionUser();
    const counts = await getAdminDashboard(user);
    return NextResponse.json({ counts });
  } catch (err) {
    return adminErrorResponse(err, "Failed to load admin dashboard");
  }
}
