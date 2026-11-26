import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth-session";
import { adminErrorResponse } from "@/modules/admin/http";
import { listMyPayments } from "@/modules/payments/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireSessionUser();
    const items = await listMyPayments(user);
    return NextResponse.json({ items });
  } catch (err) {
    return adminErrorResponse(err, "Failed to load payments");
  }
}
