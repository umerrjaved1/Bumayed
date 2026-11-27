import { describe, expect, it, vi } from "vitest";

// buildSearchWhere is a pure function; keep the database out of the test.
vi.mock("@/lib/prisma", () => ({ prisma: {} }));
vi.mock("next/cache", () => ({ revalidateTag: () => {}, unstable_cache: (fn: unknown) => fn }));

import { parseCountry, parseListingQuery } from "./query";
import { buildSearchWhere } from "./repository";
import { listingWriteSchema } from "./write-schemas";

describe("parseCountry", () => {
  it("uses a valid ?country= and ignores case", () => {
    expect(parseCountry("SA")).toBe("SA");
    expect(parseCountry("kw")).toBe("KW");
  });

  it("'all' means the whole GCC (no country filter), even with a saved default", () => {
    expect(parseCountry("all", "SA")).toBeUndefined();
    expect(parseCountry("ALL", "AE")).toBeUndefined();
  });

  it("falls back to the visitor's saved country when missing or unknown", () => {
    expect(parseCountry(undefined, "QA")).toBe("QA");
    expect(parseCountry("narnia", "QA")).toBe("QA");
    expect(parseCountry(undefined)).toBeUndefined();
  });
});

describe("parseListingQuery with countries", () => {
  it("browsing a country prices in that country's currency", () => {
    const q = parseListingQuery({ country: "KW" }, "cars");
    expect(q.country).toBe("KW");
    expect(q.currency).toBe("KWD");
  });

  it("browsing the whole GCC prices in AED", () => {
    const q = parseListingQuery({ country: "all" }, "cars", "SA");
    expect(q.country).toBeUndefined();
    expect(q.currency).toBe("AED");
  });

  it("uses the default country when the URL has none", () => {
    const q = parseListingQuery({}, "cars", "BH");
    expect(q.country).toBe("BH");
    expect(q.currency).toBe("BHD");
  });
});

/** Pull the clauses of the AND list that mention a given key. */
function clauses(where: ReturnType<typeof buildSearchWhere>, key: string) {
  return (where.AND as Record<string, unknown>[]).filter((c) => key in c);
}

describe("buildSearchWhere with countries and currencies", () => {
  it("filters by country", () => {
    const q = parseListingQuery({ country: "SA" }, "cars");
    expect(clauses(buildSearchWhere(q), "countryCode")).toEqual([
      { countryCode: "SA" },
    ]);
  });

  it("adds no country filter when browsing the whole GCC", () => {
    const q = parseListingQuery({ country: "all" }, "cars");
    expect(clauses(buildSearchWhere(q), "countryCode")).toHaveLength(0);
  });

  it("converts a price range typed in riyals to the AED equivalent", () => {
    // SAR 100,000 = AED 97,933 ; SAR 200,000 = AED 195,866
    const q = parseListingQuery(
      { country: "SA", priceMin: "100000", priceMax: "200000" },
      "cars",
    );
    const priceClauses = clauses(buildSearchWhere(q), "priceAed");
    expect(priceClauses).toEqual([
      { priceAed: { gte: 97_933 } },
      { priceAed: { lte: 195_866 } },
    ]);
  });

  it("leaves a dirham range unchanged", () => {
    const q = parseListingQuery(
      { country: "AE", priceMin: "50000", priceMax: "90000" },
      "cars",
    );
    expect(clauses(buildSearchWhere(q), "priceAed")).toEqual([
      { priceAed: { gte: 50_000 } },
      { priceAed: { lte: 90_000 } },
    ]);
  });
});

describe("listingWriteSchema (prices and regions)", () => {
  const base = {
    category: "cars" as const,
    title: "Toyota Land Cruiser GXR 2022",
    description: "Well kept, single owner, full service history available.",
    year: 2022,
    cityId: "7f0a2f66-62b0-4f0a-9c55-0f9d0a1b2c3d",
    emirateCode: "ruh",
  };

  it("accepts a price in the seller's currency and any GCC region code", () => {
    const r = listingWriteSchema.safeParse({ ...base, price: 215000 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.emirateCode).toBe("RUH"); // normalised to upper case
  });

  it("still accepts the older priceAed field", () => {
    expect(
      listingWriteSchema.safeParse({ ...base, emirateCode: "DXB", priceAed: 90000 })
        .success,
    ).toBe(true);
  });

  it("requires a price", () => {
    expect(listingWriteSchema.safeParse({ ...base }).success).toBe(false);
  });

  it("rejects decimals, zero and malformed region codes", () => {
    expect(listingWriteSchema.safeParse({ ...base, price: 1000.5 }).success).toBe(false);
    expect(listingWriteSchema.safeParse({ ...base, price: 0 }).success).toBe(false);
    expect(
      listingWriteSchema.safeParse({ ...base, price: 1000, emirateCode: "RIYADH" })
        .success,
    ).toBe(false);
  });
});
