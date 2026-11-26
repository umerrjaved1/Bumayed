import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth-session";
import { adminErrorResponse } from "@/modules/admin/http";
import { assertCan } from "@/modules/admin/policies";
import { sweepExpiryNotifications } from "@/modules/notifications/events";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const user = await requireSessionUser();
    assertCan(user, "admin.dashboard");
    const result = await sweepExpiryNotifications();
    return NextResponse.json(result);
  } catch (err) {
    return adminErrorResponse(err, "Sweep failed");
  }
}
