"use client";

import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

type PriceDisplayProps = {
  amountAed: number;
  className?: string;
};

/** Locale-aware AED price: `AED 245,000` (en) / `٢٤٥٬٠٠٠ د.إ.` style (ar-AE). */
export function PriceDisplay({ amountAed, className }: PriceDisplayProps) {
  const locale = useLocale();
  const formatted = new Intl.NumberFormat(
    locale === "ar" ? "ar-AE" : "en-AE",
    {
      style: "currency",
      currency: "AED",
      maximumFractionDigits: 0,
    },
  ).format(amountAed);

  return (
    <span className={cn("font-semibold tabular-nums text-primary", className)}>
      {formatted}
    </span>
  );
}
