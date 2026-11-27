/**
 * Everything the site knows about the six Gulf Cooperation Council countries,
 * in one place: dialling codes, currencies, names, time zones and phone
 * formats. Phone checks, geo defaults, price formatting and the country
 * selector all read from here, so adding or changing a country is one edit.
 *
 * This file has no server-only imports, so the proxy, server code and
 * browser components can all use it.
 */
export type GccCode = "AE" | "SA" | "QA" | "KW" | "BH" | "OM";
export type CurrencyCode = "AED" | "SAR" | "QAR" | "KWD" | "BHD" | "OMR";

export type GccCountry = {
  code: GccCode;
  /** Dialling code without the plus sign. */
  dial: string;
  currency: CurrencyCode;
  nameEn: string;
  /** Short name that fits a narrow dropdown. */
  shortEn: string;
  nameAr: string;
  /** Digits in the number after the country code (and without any leading 0). */
  nationalLength: number;
  /** Typical number to show as a placeholder. */
  example: string;
  timeZone: string;
  /**
   * How many AED one unit of this country's currency is worth. Used ONLY to
   * compare prices across countries (search filters and sorting), never to
   * charge anyone. AED, SAR, QAR, BHD and OMR are pegged to the US dollar, so
   * those rates are fixed. The Kuwaiti dinar tracks a basket: review it now
   * and then.
   */
  aedPerUnit: number;
};

// 1 USD = 3.6725 AED (peg). Other pegs: SAR 3.75, QAR 3.64, BHD 0.376, OMR 0.3845.
export const GCC_COUNTRIES: readonly GccCountry[] = [
  { code: "AE", dial: "971", currency: "AED", nameEn: "United Arab Emirates", shortEn: "UAE", nameAr: "الإمارات", nationalLength: 9, example: "50 123 4567", timeZone: "Asia/Dubai", aedPerUnit: 1 },
  { code: "SA", dial: "966", currency: "SAR", nameEn: "Saudi Arabia", shortEn: "Saudi", nameAr: "السعودية", nationalLength: 9, example: "50 123 4567", timeZone: "Asia/Riyadh", aedPerUnit: 0.97933 },
  { code: "QA", dial: "974", currency: "QAR", nameEn: "Qatar", shortEn: "Qatar", nameAr: "قطر", nationalLength: 8, example: "5512 3456", timeZone: "Asia/Qatar", aedPerUnit: 1.00893 },
  { code: "KW", dial: "965", currency: "KWD", nameEn: "Kuwait", shortEn: "Kuwait", nameAr: "الكويت", nationalLength: 8, example: "5012 3456", timeZone: "Asia/Kuwait", aedPerUnit: 11.97 },
  { code: "BH", dial: "973", currency: "BHD", nameEn: "Bahrain", shortEn: "Bahrain", nameAr: "البحرين", nationalLength: 8, example: "3612 3456", timeZone: "Asia/Bahrain", aedPerUnit: 9.7673 },
  { code: "OM", dial: "968", currency: "OMR", nameEn: "Oman", shortEn: "Oman", nameAr: "عُمان", nationalLength: 8, example: "9212 3456", timeZone: "Asia/Muscat", aedPerUnit: 9.5514 },
] as const;

export const DEFAULT_COUNTRY: GccCode = "AE";
export const GCC_CODES: readonly GccCode[] = GCC_COUNTRIES.map((c) => c.code);
export const GCC_CURRENCIES: readonly CurrencyCode[] = GCC_COUNTRIES.map(
  (c) => c.currency,
);

export function gccByCode(code: string | null | undefined): GccCountry | undefined {
  return GCC_COUNTRIES.find((c) => c.code === code?.toUpperCase());
}

export function gccByDial(dial: string): GccCountry | undefined {
  return GCC_COUNTRIES.find((c) => c.dial === dial);
}

export function gccByCurrency(
  currency: string | null | undefined,
): GccCountry | undefined {
  return GCC_COUNTRIES.find((c) => c.currency === currency?.toUpperCase());
}

/** The GCC country (or the UAE) for an ISO country code such as the one Vercel sends. */
export function gccOrDefault(code: string | null | undefined): GccCountry {
  return gccByCode(code) ?? gccByCode(DEFAULT_COUNTRY)!;
}

export function isGccCode(code: string | null | undefined): code is GccCode {
  return !!gccByCode(code);
}
