"use client";

import { useId } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, TriangleAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GCC_COUNTRIES,
  gccByDial,
  hasCountryCode,
  normalizePhoneInput,
  splitE164,
} from "@/modules/auth/phone";
import { cn } from "@/lib/utils";

/**
 * Mobile number with a country picker for the six GCC countries. People
 * either choose their country and type the number the usual way, or paste a
 * full +966… number and the country switches by itself.
 */
export function PhoneField({
  id = "phone",
  label,
  dial,
  onDialChange,
  value,
  onValueChange,
  error,
  invalid,
  describedBy,
  helpText,
}: {
  id?: string;
  label: string;
  dial: string;
  onDialChange: (dial: string) => void;
  value: string;
  onValueChange: (value: string) => void;
  error?: string;
  invalid?: boolean;
  describedBy?: string;
  helpText?: string;
}) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const selectId = useId();
  const country = gccByDial(dial) ?? GCC_COUNTRIES[0]!;

  /** Tidy on blur: a pasted +966… number switches the country and drops the prefix. */
  function tidy() {
    if (!value.trim()) return;
    if (hasCountryCode(value)) {
      const full = normalizePhoneInput(value, dial);
      const split = splitE164(full);
      if (split) {
        onDialChange(split.country.dial);
        onValueChange(split.national);
        return;
      }
      onValueChange(full);
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2" dir="ltr">
        <div className="relative shrink-0">
          <label htmlFor={selectId} className="sr-only">
            {t("countryCode")}
          </label>
          <select
            id={selectId}
            value={dial}
            onChange={(e) => onDialChange(e.target.value)}
            className={cn(
              "h-11 appearance-none rounded-xl border border-input bg-transparent ps-3 pe-8 text-sm font-medium outline-none transition-colors",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              invalid && "border-destructive",
            )}
          >
            {GCC_COUNTRIES.map((c) => (
              <option key={c.code} value={c.dial}>
                {locale === "ar" ? c.nameAr : c.shortEn} +{c.dial}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute end-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
        </div>
        <Input
          id={id}
          name={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder={country.example}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onBlur={tidy}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className="min-w-0 flex-1 text-start"
        />
      </div>
      {helpText && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {helpText}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="flex items-start gap-1.5 text-sm text-destructive"
        >
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}
