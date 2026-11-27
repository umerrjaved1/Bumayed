import { describe, expect, it } from "vitest";
import { parseListingQuery } from "./query";
import { listingWriteSchema } from "./write-schemas";

const base = {
  category: "plates",
  title: "Dubai plate A 1234",
  description: "Private plate, ownership papers ready.",
  priceAed: 50000,
  emirateCode: "DXB",
  cityId: "11111111-1111-4111-8111-111111111111",
  specs: {
    plateEmirate: "DXB",
    plateCode: "A",
    plateNumber: "1234",
    plateType: "private",
  },
};

describe("plate listings", () => {
  it("accepts a plate without year, make or mileage", () => {
    expect(listingWriteSchema.safeParse(base).success).toBe(true);
  });

  it("rejects bad plate details", () => {
    const bad = (specs: Record<string, string>) =>
      listingWriteSchema.safeParse({ ...base, specs: { ...base.specs, ...specs } }).success;
    expect(bad({ plateNumber: "123456" })).toBe(false);
    expect(bad({ plateNumber: "12a" })).toBe(false);
    expect(bad({ plateCode: "ABC" })).toBe(false);
    expect(bad({ plateEmirate: "XXX" })).toBe(false);
    expect(bad({ plateType: "truck" })).toBe(false);
  });

  it("still requires a year for vehicles", () => {
    const vehicle = { ...base, category: "cars", specs: {} };
    expect(listingWriteSchema.safeParse(vehicle).success).toBe(false);
    expect(listingWriteSchema.safeParse({ ...vehicle, year: 2020 }).success).toBe(true);
  });

  it("parses plate filters and drops invalid ones", () => {
    const q = parseListingQuery(
      { plateEmirate: "dxb", plateType: "Classic", plateDigits: "3", plateCode: "a" },
      "plates",
    );
    expect(q).toMatchObject({
      plateEmirate: "DXB",
      plateType: "classic",
      plateDigits: "3",
      plateCode: "A",
    });
    const bad = parseListingQuery(
      { plateEmirate: "XXX", plateType: "x", plateDigits: "9", plateCode: "###" },
      "plates",
    );
    expect(bad.plateEmirate).toBeUndefined();
    expect(bad.plateType).toBeUndefined();
    expect(bad.plateDigits).toBeUndefined();
    expect(bad.plateCode).toBeUndefined();
  });
});
