import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth-session";
import { adminErrorResponse } from "@/modules/admin/http";
import { startPackageCheckout } from "@/modules/payments/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    const body = await request.json();
    const packageId = typeof body.packageId === "string" ? body.packageId : "";
    if (!packageId) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: "packageId required" } },
        { status: 400 },
      );
    }
    const result = await startPackageCheckout({ user, packageId });
    return NextResponse.json(result);
  } catch (err) {
    return adminErrorResponse(err, "Failed to start package checkout");
  }
}
