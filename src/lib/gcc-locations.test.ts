import { describe, expect, it } from "vitest";
import { GCC_REGIONS, UAE_REGION_CODES } from "./gcc-locations";
import { GCC_CODES } from "./gcc";

const all = Object.values(GCC_REGIONS).flat();

describe("GCC region data", () => {
  it("covers the five non-UAE countries", () => {
    expect(Object.keys(GCC_REGIONS).sort()).toEqual(
      GCC_CODES.filter((c) => c !== "AE").sort(),
    );
  });

  it("has the expected number of regions per country", () => {
    expect(GCC_REGIONS.SA).toHaveLength(13);
    expect(GCC_REGIONS.QA).toHaveLength(8);
    expect(GCC_REGIONS.KW).toHaveLength(6);
    expect(GCC_REGIONS.BH).toHaveLength(4);
    expect(GCC_REGIONS.OM).toHaveLength(11);
  });

  it("uses 3-letter codes that are unique across every country, UAE included", () => {
    const codes = [...UAE_REGION_CODES, ...all.map((r) => r.code)];
    for (const code of codes) expect(code).toMatch(/^[A-Z]{3}$/);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("gives every region at least one city, with English and Arabic names", () => {
    for (const region of all) {
      expect(region.cities.length, region.code).toBeGreaterThan(0);
      for (const item of [region, ...region.cities]) {
        expect(item.nameEn.trim(), region.code).not.toBe("");
        expect(item.nameAr, region.code).toMatch(/[؀-ۿ]/); // contains Arabic letters
      }
    }
  });

  it("has no duplicate city names within a region", () => {
    for (const region of all) {
      const names = region.cities.map((c) => c.nameEn);
      expect(new Set(names).size, region.code).toBe(names.length);
    }
  });
});
