import { NextResponse } from "next/server";
import { PromotionType } from "@/generated/prisma/client";
import { requireSessionUser } from "@/lib/auth-session";
import { adminErrorResponse } from "@/modules/admin/http";
import { startPromotionCheckout } from "@/modules/payments/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    const body = await request.json();
    const listingId = typeof body.listingId === "string" ? body.listingId : "";
    const type = body.type as PromotionType;
    if (!listingId || !Object.values(PromotionType).includes(type)) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: "listingId and type required" } },
        { status: 400 },
      );
    }
    const result = await startPromotionCheckout({ user, listingId, type });
    return NextResponse.json(result);
  } catch (err) {
    return adminErrorResponse(err, "Failed to start promotion checkout");
  }
}
