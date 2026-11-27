import {
  GCC_COUNTRIES,
  gccByCurrency,
  type CurrencyCode,
} from "@/lib/gcc";

/**
 * Prices are stored in whole units of the listing's own currency (a Saudi ad
 * says SAR 85,000), plus an AED-equivalent used only to filter and sort
 * across countries. Whole units keep the model simple: no decimals anywhere.
 */

/** Highest price accepted, expressed in AED so it means the same in every currency. */
export const MAX_PRICE_AED = 100_000_000;

export function isCurrency(value: string | null | undefined): value is CurrencyCode {
  return !!gccByCurrency(value);
}

function rate(currency: CurrencyCode): number {
  return gccByCurrency(currency)?.aedPerUnit ?? 1;
}

/** SAR 85,000 → the AED amount used for cross-country search and sorting. */
export function toAedEquivalent(amount: number, currency: CurrencyCode): number {
  return Math.round(amount * rate(currency));
}

/**
 * The most a price in `currency` may be. Rounded down so that its AED
 * equivalent never goes over MAX_PRICE_AED.
 */
export function maxPriceFor(currency: CurrencyCode): number {
  return Math.floor(MAX_PRICE_AED / rate(currency));
}

/**
 * Turn a price range typed in `currency` into AED-equivalent bounds for the
 * database. The minimum rounds down and the maximum rounds up, so an ad that
 * sits exactly on the edge is never wrongly left out.
 */
export function rangeToAed(
  range: { min?: number; max?: number },
  currency: CurrencyCode,
): { min?: number; max?: number } {
  const r = rate(currency);
  return {
    min: range.min == null ? undefined : Math.floor(range.min * r),
    max: range.max == null ? undefined : Math.ceil(range.max * r),
  };
}

/** "SAR 85,000" / "٨٥٬٠٠٠ ر.س." — whole amounts, the currency's own symbol. */
export function formatMoney(
  amount: number,
  currency: CurrencyCode,
  locale: string,
): string {
  const country = gccByCurrency(currency) ?? GCC_COUNTRIES[0]!;
  const tag = locale === "ar" ? `ar-${country.code}` : `en-${country.code}`;
  try {
    return new Intl.NumberFormat(tag, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Unknown locale tag in this runtime: fall back to a neutral one.
    return new Intl.NumberFormat(locale === "ar" ? "ar-AE" : "en-AE", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  }
}
