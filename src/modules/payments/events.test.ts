import { describe, expect, it } from "vitest";
import { decideEntitlement, type ProviderEvent } from "./events";
import { signPayload, verifySignature } from "./signature";

const success: ProviderEvent = {
  providerEventId: "evt_1",
  type: "payment.succeeded",
  idempotencyKey: "pay_1",
};

describe("payment entitlements", () => {
  it("grants on a first successful webhook while payment is pending", () => {
    expect(
      decideEntitlement({
        event: success,
        paymentStatus: "PENDING",
        eventAlreadyStored: false,
      }),
    ).toBe("grant");
  });

  it("does not grant again when the same webhook is delivered twice", () => {
    expect(
      decideEntitlement({
        event: success,
        paymentStatus: "SUCCEEDED",
        eventAlreadyStored: true,
      }),
    ).toBe("duplicate");
  });

  it("does not grant a delayed success after the payment already succeeded", () => {
    expect(
      decideEntitlement({
        event: { ...success, providerEventId: "evt_late" },
        paymentStatus: "SUCCEEDED",
        eventAlreadyStored: false,
      }),
    ).toBe("ignore");
  });

  it("still grants a delayed success that arrives while payment is initiated", () => {
    expect(
      decideEntitlement({
        event: success,
        paymentStatus: "INITIATED",
        eventAlreadyStored: false,
      }),
    ).toBe("grant");
  });

  it("marks failed and cancelled without granting", () => {
    expect(
      decideEntitlement({
        event: { ...success, type: "payment.failed", providerEventId: "f" },
        paymentStatus: "PENDING",
        eventAlreadyStored: false,
      }),
    ).toBe("mark_failed");
    expect(
      decideEntitlement({
        event: { ...success, type: "payment.cancelled", providerEventId: "c" },
        paymentStatus: "INITIATED",
        eventAlreadyStored: false,
      }),
    ).toBe("mark_cancelled");
  });

  it("revokes only after a succeeded payment is refunded", () => {
    expect(
      decideEntitlement({
        event: { ...success, type: "payment.refunded", providerEventId: "r" },
        paymentStatus: "SUCCEEDED",
        eventAlreadyStored: false,
      }),
    ).toBe("revoke");
    expect(
      decideEntitlement({
        event: { ...success, type: "payment.refunded", providerEventId: "r2" },
        paymentStatus: "PENDING",
        eventAlreadyStored: false,
      }),
    ).toBe("ignore");
  });
});

describe("webhook signature", () => {
  it("accepts a matching signature and rejects a tampered body", () => {
    const body = JSON.stringify({ ok: true });
    const sig = signPayload("sandbox-secret", body);
    expect(verifySignature("sandbox-secret", body, sig)).toBe(true);
    expect(verifySignature("sandbox-secret", body + " ", sig)).toBe(false);
    expect(verifySignature("sandbox-secret", body, null)).toBe(false);
  });
});
