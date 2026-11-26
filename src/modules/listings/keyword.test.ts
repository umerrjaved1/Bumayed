import { describe, expect, it } from "vitest";
import { keywordTerms, normalizeArabic, termVariants } from "./keyword";

describe("keywordTerms", () => {
  it("splits on spaces, trims punctuation and dedupes", () => {
    expect(keywordTerms("  Land  Cruiser, land! ")).toEqual([
      "land",
      "cruiser",
    ]);
  });

  it("keeps Arabic words", () => {
    expect(keywordTerms("تويوتا لاند")).toEqual(["تويوتا", "لاند"]);
  });

  it("caps the number of words", () => {
    expect(keywordTerms("a b c d e f g h")).toHaveLength(6);
  });
});

describe("termVariants", () => {
  it("splits letter/digit boundaries so G63 matches 'G 63'", () => {
    expect(termVariants("g63")).toEqual(
      expect.arrayContaining(["g63", "g 63", "g-63"]),
    );
  });

  it("joins hyphenated forms", () => {
    expect(termVariants("x-5")).toEqual(expect.arrayContaining(["x5", "x 5"]));
  });

  it("adds a normalised Arabic form", () => {
    expect(termVariants("أودي")).toContain("اودي");
  });

  it("returns the word alone when nothing applies", () => {
    expect(termVariants("patrol")).toEqual(["patrol"]);
  });
});

describe("normalizeArabic", () => {
  it("unifies alef, ya and ta marbuta forms", () => {
    expect(normalizeArabic("إآأىة")).toBe("ااايه");
  });
});
