import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth-session";
import { adminErrorResponse } from "@/modules/admin/http";
import {
  activeProvider,
  applySignedWebhook,
  buildSandboxEvent,
  getOwnedPayment,
  sandboxPaymentsAllowed,
} from "@/modules/payments/service";
import type { ProviderEvent } from "@/modules/payments/events";

export const dynamic = "force-dynamic";

const OUTCOMES: Record<string, ProviderEvent["type"]> = {
  success: "payment.succeeded",
  fail: "payment.failed",
  cancel: "payment.cancelled",
  refund: "payment.refunded",
};

/**
 * Sandbox stand-in for the provider. It signs an event and feeds the same
 * webhook handler. Calling this twice with the same event id is a duplicate.
 */
export async function POST(request: Request) {
  try {
    if (activeProvider() !== "sandbox" || !sandboxPaymentsAllowed()) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Sandbox disabled" } },
        { status: 403 },
      );
    }
    const user = await requireSessionUser();
    const body = await request.json();
    const paymentId = typeof body.paymentId === "string" ? body.paymentId : "";
    const outcome = typeof body.outcome === "string" ? body.outcome : "";
    const type = OUTCOMES[outcome];
    if (!paymentId || !type) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: "paymentId and outcome required" } },
        { status: 400 },
      );
    }
    const payment = await getOwnedPayment(user, paymentId);
    const eventId =
      typeof body.providerEventId === "string" ? body.providerEventId : undefined;
    const signed = buildSandboxEvent({
      idempotencyKey: payment.idempotencyKey,
      type,
      providerEventId: eventId,
    });
    const result = await applySignedWebhook(signed.body, signed.signature);
    return NextResponse.json(result);
  } catch (err) {
    return adminErrorResponse(err, "Sandbox simulation failed");
  }
}
