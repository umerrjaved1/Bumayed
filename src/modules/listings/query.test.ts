import { describe, expect, it } from "vitest";
import { buildQueryString, parseListingQuery } from "./query";

describe("parseListingQuery", () => {
  it("parses filters and defaults sort/page", () => {
    const q = parseListingQuery(
      {
        keyword: "patrol",
        regionalSpec: "gcc",
        priceMax: "300000",
        sort: "priceAsc",
        page: "2",
      },
      "cars",
    );
    expect(q).toMatchObject({
      category: "cars",
      keyword: "patrol",
      regionalSpec: "gcc",
      priceMax: 300000,
      sort: "priceAsc",
      page: 2,
    });
  });

  it("drops invalid sort/condition and clamps page", () => {
    const q = parseListingQuery(
      { sort: "nope", condition: "broken", page: "0" },
      "boats",
    );
    expect(q.sort).toBe("newest");
    expect(q.condition).toBeUndefined();
    expect(q.page).toBe(1);
  });
});

describe("buildQueryString", () => {
  it("merges overrides and drops empties", () => {
    expect(
      buildQueryString(
        { make: "Nissan", page: "2" },
        { page: 1, sort: "priceAsc", make: undefined },
      ),
    ).toBe("?page=1&sort=priceAsc");
  });
});

describe("parseListingQuery ranges", () => {
  it("swaps a min price above the max price", () => {
    const q = parseListingQuery(
      { priceMin: "300000", priceMax: "100000" },
      "cars",
    );
    expect([q.priceMin, q.priceMax]).toEqual([100000, 300000]);
  });

  it("swaps an inverted year range and keeps one-sided ranges", () => {
    const q = parseListingQuery({ yearMin: "2024", yearMax: "2020" }, "cars");
    expect([q.yearMin, q.yearMax]).toEqual([2020, 2024]);
    const one = parseListingQuery({ priceMin: "5000" }, "cars");
    expect([one.priceMin, one.priceMax]).toEqual([5000, undefined]);
  });
});
