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
