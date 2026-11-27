"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { Languages, Loader2 } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/** Each button shows the language you would switch TO, written in that language. */
const TARGET_LABELS: Record<Locale, { label: string; aria: string }> = {
  en: { label: "English", aria: "Switch to English" },
  ar: { label: "العربية", aria: "التبديل إلى العربية" },
};

/** One-tap switch between the two languages (English ⇄ Arabic). */
export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const target = routing.locales.find((l) => l !== locale) ?? "en";
  const { label, aria } = TARGET_LABELS[target];

  function onSwitch() {
    startTransition(() =>
      // Keep filters, sort and page when switching language.
      router.replace(
        {
          pathname,
          // Read at click time; useSearchParams would stop pages from prerendering.
          query: Object.fromEntries(
            new URLSearchParams(window.location.search),
          ),
        },
        { locale: target },
      ),
    );
  }

  return (
    <button
      type="button"
      onClick={onSwitch}
      disabled={isPending}
      aria-label={aria}
      lang={target}
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-full border bg-background/60 px-3.5 text-sm font-semibold transition-all hover:border-accent hover:bg-accent/10 active:scale-95 disabled:opacity-60 md:h-9",
      )}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        <Languages className="size-4 text-accent" aria-hidden />
      )}
      {label}
    </button>
  );
}
