import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth-session";
import { adminErrorResponse } from "@/modules/admin/http";
import { assertCan } from "@/modules/admin/policies";
import { sweepExpiryNotifications } from "@/modules/notifications/events";

export const dynamic = "force-dynamic";

/**
 * Daily Vercel cron (see vercel.json). Vercel sends
 * `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set on the project.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    );
  }
  try {
    const result = await sweepExpiryNotifications();
    return NextResponse.json(result);
  } catch (err) {
    return adminErrorResponse(err, "Sweep failed");
  }
}

/** Manual run by an admin. */
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
