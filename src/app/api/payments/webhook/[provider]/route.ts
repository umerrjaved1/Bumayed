import { NextResponse } from "next/server";
import { adminErrorResponse } from "@/modules/admin/http";
import { activeProvider, applySignedWebhook } from "@/modules/payments/service";

export const dynamic = "force-dynamic";

/**
 * Entitlements are granted only here, after signature verification.
 * The browser return URL never activates a promotion or package.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ provider: string }> },
) {
  try {
    const { provider } = await context.params;
    if (provider !== activeProvider()) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Unknown provider" } },
        { status: 403 },
      );
    }
    const raw = await request.text();
    const signature = request.headers.get("x-bumayed-signature");
    const result = await applySignedWebhook(raw, signature);
    return NextResponse.json(result);
  } catch (err) {
    return adminErrorResponse(err, "Webhook failed");
  }
}
