import { describe, expect, it } from "vitest";
import {
  gccOrDefault,
  hasCountryCode,
  isValidPhone,
  looksLikePhone,
  normalizePhoneInput,
  splitE164,
} from "./phone";

describe("normalizePhoneInput (UAE default)", () => {
  it.each([
    ["050 123 4567", "+971501234567"],
    ["0501234567", "+971501234567"],
    ["501234567", "+971501234567"],
    ["971501234567", "+971501234567"],
    ["00971501234567", "+971501234567"],
    ["+971 50-123-4567", "+971501234567"],
    ["(050) 123 4567", "+971501234567"],
    ["٠٥٠ ١٢٣ ٤٥٦٧", "+971501234567"], // Arabic-Indic digits
    ["+447911123456", "+447911123456"], // other countries untouched
    ["", ""],
  ])("%s -> %s", (input, expected) => {
    expect(normalizePhoneInput(input)).toBe(expected);
  });
});

describe("normalizePhoneInput (other GCC countries)", () => {
  it.each([
    ["0501234567", "966", "+966501234567"], // Saudi, local format with leading 0
    ["50 123 4567", "966", "+966501234567"],
    ["966501234567", "971", "+966501234567"], // code typed without plus, even with UAE selected
    ["00966501234567", "971", "+966501234567"],
    ["5512 3456", "974", "+97455123456"], // Qatar, 8 digits, no trunk zero
    ["97455123456", "971", "+97455123456"],
    ["5012 3456", "965", "+96550123456"], // Kuwait
    ["3612 3456", "973", "+97336123456"], // Bahrain
    ["9212 3456", "968", "+96892123456"], // Oman
    ["+96892123456", "971", "+96892123456"], // explicit + beats the selected country
  ])("%s with +%s -> %s", (input, dial, expected) => {
    expect(normalizePhoneInput(input, dial)).toBe(expected);
  });
});

describe("isValidPhone", () => {
  it("accepts correct GCC lengths", () => {
    for (const n of [
      "+971501234567",
      "+966501234567",
      "+97455123456",
      "+96550123456",
      "+97336123456",
      "+96892123456",
    ]) {
      expect(isValidPhone(n), n).toBe(true);
    }
  });

  it("rejects wrong GCC lengths and bad shapes", () => {
    expect(isValidPhone("+97150123456")).toBe(false); // UAE with 8 digits
    expect(isValidPhone("+9665012345678")).toBe(false); // Saudi with 10 digits
    expect(isValidPhone("+974551234567")).toBe(false); // Qatar with 9 digits
    expect(isValidPhone("0501234567")).toBe(false); // no country code
    expect(isValidPhone("+0123456789")).toBe(false);
    expect(isValidPhone("+97150")).toBe(false);
  });

  it("allows numbers from outside the GCC (general E.164 only)", () => {
    expect(isValidPhone("+447911123456")).toBe(true);
    expect(isValidPhone("+923001234567")).toBe(true);
  });
});

describe("helpers", () => {
  it("looksLikePhone tells numbers from emails", () => {
    expect(looksLikePhone("050 123 4567")).toBe(true);
    expect(looksLikePhone("+971501234567")).toBe(true);
    expect(looksLikePhone("name@email.com")).toBe(false);
    expect(looksLikePhone("ali")).toBe(false);
  });

  it("hasCountryCode spots + and 00", () => {
    expect(hasCountryCode("+966 50 123 4567")).toBe(true);
    expect(hasCountryCode("00966501234567")).toBe(true);
    expect(hasCountryCode("0501234567")).toBe(false);
  });

  it("splitE164 finds the country", () => {
    expect(splitE164("+966501234567")?.country.code).toBe("SA");
    expect(splitE164("+966501234567")?.national).toBe("501234567");
    expect(splitE164("+447911123456")).toBeNull();
  });

  it("gccOrDefault falls back to the UAE", () => {
    expect(gccOrDefault("sa").code).toBe("SA");
    expect(gccOrDefault("PK").code).toBe("AE");
    expect(gccOrDefault(null).code).toBe("AE");
  });
});
