/**
 * Number-plate helpers shared by the wizard, validation, mapping and filters.
 *
 * A plate ad stores its details in `Listing.specs`:
 *   plateEmirate  AUH | DXB | SHJ | AJM | UAQ | RAK | FUJ  (who issued it)
 *   plateCode     1–2 letters or digits, e.g. "A", "AA", "12"
 *   plateNumber   1–5 digits, e.g. "7", "1234"
 *   plateType     private | motorcycle | classic
 */

export const PLATE_EMIRATES = [
  "AUH",
  "DXB",
  "SHJ",
  "AJM",
  "UAQ",
  "RAK",
  "FUJ",
] as const;
export type PlateEmirate = (typeof PLATE_EMIRATES)[number];

export const PLATE_TYPES = ["private", "motorcycle", "classic"] as const;
export type PlateType = (typeof PLATE_TYPES)[number];

export const PLATE_DIGIT_COUNTS = ["1", "2", "3", "4", "5"] as const;

export const PLATE_CODE_RE = /^[A-Z0-9]{1,2}$/;
export const PLATE_NUMBER_RE = /^\d{1,5}$/;

export type PlateDetails = {
  emirate: PlateEmirate;
  code: string;
  number: string;
  type: PlateType;
};

/** Uppercase and strip anything that cannot be part of a plate code. */
export function normalizePlateCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 2);
}

/** Digits only, no leading zeros stripped (plates like "0007" do not exist, but "7" does). */
export function normalizePlateNumber(input: string): string {
  return input.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 5);
}

/** A readable fallback title, e.g. "Dubai plate A 1234". */
export function plateTitle(
  emirateName: string,
  code: string,
  number: string,
): string {
  return `${emirateName} plate ${code} ${number}`.trim();
}

export function isPlateEmirate(v: unknown): v is PlateEmirate {
  return typeof v === "string" && (PLATE_EMIRATES as readonly string[]).includes(v);
}

export function isPlateType(v: unknown): v is PlateType {
  return typeof v === "string" && (PLATE_TYPES as readonly string[]).includes(v);
}

/** Pull plate details out of raw specs; null when any part is missing/invalid. */
export function readPlateSpecs(
  specs: Record<string, unknown>,
): PlateDetails | null {
  const emirate = specs.plateEmirate;
  const code = specs.plateCode;
  const number = specs.plateNumber;
  const type = specs.plateType ?? "private";
  if (
    !isPlateEmirate(emirate) ||
    typeof code !== "string" ||
    !PLATE_CODE_RE.test(code) ||
    typeof number !== "string" ||
    !PLATE_NUMBER_RE.test(number) ||
    !isPlateType(type)
  ) {
    return null;
  }
  return { emirate, code, number, type };
}
