"use client";

import { useLocale } from "next-intl";
import { formatMoney } from "@/lib/currency";
import type { CurrencyCode } from "@/lib/gcc";
import { cn } from "@/lib/utils";

type PriceDisplayProps = {
  /** Whole units of `currency` (what the seller typed). */
  amount?: number;
  currency?: CurrencyCode;
  /** Older callers pass dirhams only (packages, promotions, admin). */
  amountAed?: number;
  className?: string;
};

/**
 * A price in its own currency: `SAR 85,000` (en) / `٨٥٬٠٠٠ ر.س.` (ar).
 * Whole amounts only, with the currency's own symbol.
 */
export function PriceDisplay({
  amount,
  currency = "AED",
  amountAed,
  className,
}: PriceDisplayProps) {
  const locale = useLocale();
  const value = amount ?? amountAed ?? 0;

  return (
    <span className={cn("font-semibold tabular-nums text-primary", className)}>
      {formatMoney(value, currency, locale)}
    </span>
  );
}
