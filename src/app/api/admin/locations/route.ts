import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth-session";
import { adminErrorResponse } from "@/modules/admin/http";
import { getLocations } from "@/modules/admin/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireSessionUser();
    const emirates = await getLocations(user);
    return NextResponse.json({ emirates });
  } catch (err) {
    return adminErrorResponse(err, "Failed to load locations");
  }
}
