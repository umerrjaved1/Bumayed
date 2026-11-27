/**
 * Phone numbers for the six GCC countries. People type numbers every which
 * way ("050 123 4567", "0501234567", "00966501234567", Arabic digits), so we
 * turn them into the +<country><number> form the server expects instead of
 * ending in a "must be E.164" error.
 */
// The country table lives in one shared place; re-exported here so existing
// imports keep working.
import { GCC_COUNTRIES, type GccCountry } from "@/lib/gcc";

export {
  DEFAULT_COUNTRY,
  GCC_COUNTRIES,
  gccByCode,
  gccByDial,
  gccOrDefault,
  type GccCode,
  type GccCountry,
} from "@/lib/gcc";

const ARABIC_INDIC = "٠١٢٣٤٥٦٧٨٩";
const EXTENDED_ARABIC_INDIC = "۰۱۲۳۴۵۶۷۸۹";

function toWesternDigits(s: string): string {
  return s.replace(/[٠-٩۰-۹]/g, (ch) => {
    const i = ARABIC_INDIC.indexOf(ch);
    return String(i >= 0 ? i : EXTENDED_ARABIC_INDIC.indexOf(ch));
  });
}

/**
 * Anything a person might type → "+<country><number>".
 * `defaultDial` is the country used when the number has no country code,
 * for example "966" turns 0501234567 into +966501234567.
 */
export function normalizePhoneInput(raw: string, defaultDial = "971"): string {
  const s = toWesternDigits(raw.trim()).replace(/[\s\-().]/g, "");
  if (!s) return "";
  if (s.startsWith("+")) return s;
  if (s.startsWith("00")) return `+${s.slice(2)}`;
  // Typed with the country code but without the plus: 966501234567
  const withCode = GCC_COUNTRIES.find(
    (c) => s.startsWith(c.dial) && s.length === c.dial.length + c.nationalLength,
  );
  if (withCode) return `+${s}`;
  // Local number, with or without the leading 0 (0501234567 / 501234567)
  const local = s.replace(/^0/, "");
  if (/^\d+$/.test(local)) return `+${defaultDial}${local}`;
  return s;
}

/**
 * "+" then 8–15 digits. For GCC numbers the length must also match the
 * country (a Saudi number with 8 digits is a typo). Prefixes are not checked,
 * so newly released number ranges are never rejected.
 */
export function isValidPhone(e164: string): boolean {
  if (!/^\+[1-9]\d{7,14}$/.test(e164)) return false;
  const digits = e164.slice(1);
  const country = GCC_COUNTRIES.find((c) => digits.startsWith(c.dial));
  if (!country) return true; // other countries: only the general E.164 check
  return digits.length - country.dial.length === country.nationalLength;
}

/** Does this sign-in identifier look like a phone number rather than an email? */
export function looksLikePhone(raw: string): boolean {
  const s = toWesternDigits(raw.trim());
  return !s.includes("@") && /^[+\d][\d\s\-().]{5,}$/.test(s);
}

/** True when the text already carries its own country code (+… or 00…). */
export function hasCountryCode(raw: string): boolean {
  const s = toWesternDigits(raw.trim()).replace(/[\s\-().]/g, "");
  return s.startsWith("+") || s.startsWith("00");
}

/** "+966501234567" → { country: Saudi Arabia, national: "501234567" } */
export function splitE164(
  e164: string,
): { country: GccCountry; national: string } | null {
  if (!e164.startsWith("+")) return null;
  const digits = e164.slice(1);
  const country = GCC_COUNTRIES.find((c) => digits.startsWith(c.dial));
  return country ? { country, national: digits.slice(country.dial.length) } : null;
}
