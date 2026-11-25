import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth-session";
import { adminErrorResponse } from "@/modules/admin/http";
import { getAdmins } from "@/modules/admin/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireSessionUser();
    const items = await getAdmins(user);
    return NextResponse.json({ items });
  } catch (err) {
    return adminErrorResponse(err, "Failed to load admins");
  }
}
