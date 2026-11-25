import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth-session";
import { adminErrorResponse } from "@/modules/admin/http";
import { getCatalog } from "@/modules/admin/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireSessionUser();
    const catalog = await getCatalog(user);
    return NextResponse.json(catalog);
  } catch (err) {
    return adminErrorResponse(err, "Failed to load catalog");
  }
}
