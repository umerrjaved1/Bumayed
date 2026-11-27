import { describe, expect, it } from "vitest";
import {
  GCC_CODES,
  GCC_COUNTRIES,
  GCC_CURRENCIES,
  gccByCode,
  gccByCurrency,
  gccByDial,
  gccOrDefault,
} from "./gcc";
import {
  MAX_PRICE_AED,
  formatMoney,
  isCurrency,
  maxPriceFor,
  rangeToAed,
  toAedEquivalent,
} from "./currency";

describe("GCC country table", () => {
  it("covers exactly the six countries with unique codes, dials and currencies", () => {
    expect(GCC_CODES).toEqual(["AE", "SA", "QA", "KW", "BH", "OM"]);
    expect(new Set(GCC_COUNTRIES.map((c) => c.dial)).size).toBe(6);
    expect(new Set(GCC_CURRENCIES).size).toBe(6);
  });

  it("looks countries up by code, dial and currency", () => {
    expect(gccByCode("sa")?.currency).toBe("SAR");
    expect(gccByDial("965")?.code).toBe("KW");
    expect(gccByCurrency("OMR")?.code).toBe("OM");
    expect(gccByCode("US")).toBeUndefined();
    expect(gccOrDefault("US").code).toBe("AE");
  });

  it("has a positive rate for every currency and AED is the base", () => {
    for (const c of GCC_COUNTRIES) expect(c.aedPerUnit).toBeGreaterThan(0);
    expect(gccByCode("AE")?.aedPerUnit).toBe(1);
  });
});

describe("toAedEquivalent", () => {
  it("leaves AED alone", () => {
    expect(toAedEquivalent(250_000, "AED")).toBe(250_000);
  });

  it("converts the pegged currencies using the fixed rates", () => {
    expect(toAedEquivalent(100_000, "SAR")).toBe(97_933);
    expect(toAedEquivalent(100_000, "QAR")).toBe(100_893);
    expect(toAedEquivalent(10_000, "BHD")).toBe(97_673);
    expect(toAedEquivalent(10_000, "OMR")).toBe(95_514);
  });

  it("converts dinars (the high-value currency) to a sensible AED amount", () => {
    expect(toAedEquivalent(5_000, "KWD")).toBe(59_850);
  });

  it("always returns whole numbers", () => {
    for (const currency of GCC_CURRENCIES) {
      expect(Number.isInteger(toAedEquivalent(12_345, currency))).toBe(true);
    }
  });
});

describe("maxPriceFor", () => {
  it("never lets the AED equivalent pass the cap, in any currency", () => {
    for (const currency of GCC_CURRENCIES) {
      const max = maxPriceFor(currency);
      expect(toAedEquivalent(max, currency)).toBeLessThanOrEqual(MAX_PRICE_AED);
      expect(max).toBeGreaterThan(0);
    }
  });
});

describe("rangeToAed", () => {
  it("rounds the minimum down and the maximum up so edge ads are kept", () => {
    const r = rangeToAed({ min: 10, max: 10 }, "SAR"); // 10 SAR = 9.7933 AED
    expect(r.min).toBe(9);
    expect(r.max).toBe(10);
  });

  it("passes through open-ended ranges", () => {
    expect(rangeToAed({ min: 100 }, "AED")).toEqual({ min: 100, max: undefined });
    expect(rangeToAed({}, "KWD")).toEqual({ min: undefined, max: undefined });
  });
});

describe("isCurrency", () => {
  it("accepts the six GCC currencies only", () => {
    expect(isCurrency("SAR")).toBe(true);
    expect(isCurrency("USD")).toBe(false);
    expect(isCurrency(undefined)).toBe(false);
  });
});

describe("formatMoney", () => {
  it("shows whole amounts with the currency", () => {
    expect(formatMoney(85_000, "SAR", "en")).toMatch(/85,000/);
    expect(formatMoney(85_000, "SAR", "en")).toMatch(/SAR|SR/);
    expect(formatMoney(4_500, "KWD", "en")).toMatch(/4,500/);
    expect(formatMoney(4_500, "KWD", "en")).not.toMatch(/\.\d/); // no decimals
  });

  it("formats in Arabic with Arabic-Indic digits", () => {
    expect(formatMoney(85_000, "SAR", "ar")).toMatch(/٨٥[٬,]٠٠٠/);
  });
});
