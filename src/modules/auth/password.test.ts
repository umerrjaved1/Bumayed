import { describe, expect, it } from "vitest";
import { hashPassword, isStrongPassword, verifyPassword } from "./password";

describe("password helpers", () => {
  it("accepts strong passwords", () => {
    expect(isStrongPassword("short")).toBe(false);
    expect(isStrongPassword("longenough")).toBe(true);
  });

  it("hashes and verifies", async () => {
    const hash = await hashPassword("DevPassword123!");
    expect(hash.startsWith("$2")).toBe(true);
    expect(await verifyPassword("DevPassword123!", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });

  it("rejects non-bcrypt placeholders", async () => {
    expect(await verifyPassword("x", "$dev$not-a-real-hash")).toBe(false);
  });
});
