import { describe, expect, it } from "vitest";
import {
  assertTransition,
  canTransition,
  ListingStatus,
} from "./lifecycle";

describe("listing lifecycle", () => {
  it("allows user submit draft → pending", () => {
    expect(canTransition("DRAFT", "PENDING", "user")).toBe(true);
  });

  it("blocks user from approving listings", () => {
    expect(canTransition("PENDING", "ACTIVE", "user")).toBe(false);
    expect(canTransition("PENDING", "ACTIVE", "moderator")).toBe(true);
  });

  it("allows user pause/reactivate/sold on active", () => {
    expect(canTransition("ACTIVE", "PAUSED", "user")).toBe(true);
    expect(canTransition("PAUSED", "ACTIVE", "user")).toBe(true);
    expect(canTransition("ACTIVE", "SOLD", "user")).toBe(true);
  });

  it("allows system expiry and user renew", () => {
    expect(canTransition("ACTIVE", "EXPIRED", "system")).toBe(true);
    expect(canTransition("EXPIRED", "ACTIVE", "user")).toBe(true);
  });

  it("throws on illegal transition", () => {
    expect(() =>
      assertTransition(ListingStatus.SOLD, ListingStatus.ACTIVE, "user"),
    ).toThrow(/Invalid listing transition/);
  });
});
