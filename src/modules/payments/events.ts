export const PAYMENT_EVENT_TYPES = [
  "payment.succeeded",
  "payment.failed",
  "payment.cancelled",
  "payment.refunded",
] as const;

export type PaymentEventType = (typeof PAYMENT_EVENT_TYPES)[number];

export type ProviderEvent = {
  providerEventId: string;
  type: PaymentEventType;
  idempotencyKey: string;
  providerRef?: string;
};

/**
 * What a verified webhook may do.
 * A second event with the same providerEventId is always a duplicate.
 * A later success after the payment is already SUCCEEDED does not grant again.
 */
export function decideEntitlement(input: {
  event: ProviderEvent;
  paymentStatus:
    | "INITIATED"
    | "PENDING"
    | "SUCCEEDED"
    | "FAILED"
    | "CANCELLED"
    | "REFUNDED";
  eventAlreadyStored: boolean;
}): "grant" | "mark_failed" | "mark_cancelled" | "revoke" | "duplicate" | "ignore" {
  if (input.eventAlreadyStored) return "duplicate";

  if (input.event.type === "payment.succeeded") {
    if (
      input.paymentStatus === "INITIATED" ||
      input.paymentStatus === "PENDING"
    ) {
      return "grant";
    }
    return "ignore";
  }

  if (input.event.type === "payment.failed") {
    if (input.paymentStatus === "SUCCEEDED") return "ignore";
    return "mark_failed";
  }

  if (input.event.type === "payment.cancelled") {
    if (input.paymentStatus === "SUCCEEDED") return "ignore";
    return "mark_cancelled";
  }

  if (input.event.type === "payment.refunded") {
    if (input.paymentStatus !== "SUCCEEDED") return "ignore";
    return "revoke";
  }

  return "ignore";
}
