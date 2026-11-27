import { describe, expect, it } from "vitest";
import {
  normalizePlateCode,
  normalizePlateNumber,
  plateTitle,
  readPlateSpecs,
} from "./plates";

describe("plates", () => {
  it("normalizes codes to 1–2 uppercase letters/digits", () => {
    expect(normalizePlateCode("a")).toBe("A");
    expect(normalizePlateCode(" a-b!c ")).toBe("AB");
    expect(normalizePlateCode("12")).toBe("12");
  });

  it("keeps digits only, at most five, no leading zeros", () => {
    expect(normalizePlateNumber("12 34")).toBe("1234");
    expect(normalizePlateNumber("0007")).toBe("7");
    expect(normalizePlateNumber("0")).toBe("0");
    expect(normalizePlateNumber("123456")).toBe("12345");
  });

  it("builds a readable title", () => {
    expect(plateTitle("Dubai", "A", "1234")).toBe("Dubai plate A 1234");
  });

  it("reads valid specs and rejects broken ones", () => {
    expect(
      readPlateSpecs({
        plateEmirate: "DXB",
        plateCode: "A",
        plateNumber: "7",
        plateType: "classic",
      }),
    ).toEqual({ emirate: "DXB", code: "A", number: "7", type: "classic" });
    expect(readPlateSpecs({ plateEmirate: "XXX", plateCode: "A", plateNumber: "7" })).toBeNull();
    expect(readPlateSpecs({ plateEmirate: "DXB", plateCode: "ABC", plateNumber: "7" })).toBeNull();
    expect(readPlateSpecs({ plateEmirate: "DXB", plateCode: "A", plateNumber: "" })).toBeNull();
  });

  it("defaults the type to private", () => {
    expect(
      readPlateSpecs({ plateEmirate: "AUH", plateCode: "5", plateNumber: "99" })?.type,
    ).toBe("private");
  });
});
