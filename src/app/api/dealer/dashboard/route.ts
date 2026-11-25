import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth-session";
import { adminErrorResponse } from "@/modules/admin/http";
import { getDealerDashboard } from "@/modules/dealer/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireSessionUser();
    const data = await getDealerDashboard(user);
    return NextResponse.json(data);
  } catch (err) {
    return adminErrorResponse(err, "Failed to load dealer dashboard");
  }
}
