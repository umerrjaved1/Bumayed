import { describe, expect, it } from "vitest";
import { registerSchema } from "./schemas";

describe("registerSchema", () => {
  it("requires email or phone", () => {
    const r = registerSchema.safeParse({
      displayName: "Ali",
      accountType: "individual",
      email: "",
      phone: "",
      password: "password1",
    });
    expect(r.success).toBe(false);
  });

  it("accepts phone-only individual", () => {
    const r = registerSchema.safeParse({
      displayName: "Ali",
      accountType: "individual",
      email: "",
      phone: "+971501234567",
      password: "password1",
    });
    expect(r.success).toBe(true);
  });

  it("requires business name for dealers", () => {
    const r = registerSchema.safeParse({
      displayName: "Ali",
      accountType: "dealer",
      email: "a@b.com",
      phone: "",
      password: "password1",
    });
    expect(r.success).toBe(false);
  });
});

describe("registerSchema locale", () => {
  it("accepts en/ar and rejects anything else", () => {
    const base = {
      displayName: "Ali",
      accountType: "individual" as const,
      email: "",
      phone: "+971501234567",
      password: "password1",
    };
    expect(registerSchema.safeParse({ ...base, locale: "ar" }).success).toBe(true);
    expect(registerSchema.safeParse({ ...base, locale: "fr" }).success).toBe(false);
  });
});
