"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, ChevronDown, Globe, Loader2 } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { gccByCode, type GccCode } from "@/lib/gcc";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const COOKIE = "bumayed_country";
const ALL = "all";

/** Remember the choice for a year. Blocked cookies just mean it is not remembered. */
function saveChoice(value: string) {
  try {
    document.cookie = `${COOKIE}=${value}; path=/; max-age=31536000; samesite=lax`;
  } catch {
    /* ignore */
  }
}

type Props = {
  /** Codes of the countries that are switched on. */
  countries: GccCode[];
  /** The country being browsed; undefined means the whole GCC. */
  selected: GccCode | undefined;
  /** "pill": dropdown in the header. "list": always-open list for the phone menu. */
  variant?: "pill" | "list";
  onChosen?: () => void;
};

/**
 * Lets a visitor choose whose ads they see: one country, or the whole GCC.
 * The choice is remembered in a cookie and applies to browse pages and the
 * homepage. It only appears once more than one country is switched on.
 */
export function CountrySwitcher({
  countries,
  selected,
  variant = "pill",
  onChosen,
}: Props) {
  const t = useTranslations("country");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  if (countries.length < 2) return null;

  const nameOf = (code: GccCode, short = false) => {
    const c = gccByCode(code)!;
    return locale === "ar" ? c.nameAr : short ? c.shortEn : c.nameEn;
  };
  const currentLabel = selected ? nameOf(selected, true) : t("all");

  function choose(value: GccCode | typeof ALL) {
    saveChoice(value);
    onChosen?.();
    // A country in the URL would override the new choice, and a region or page
    // number from the old country would no longer make sense.
    const params = new URLSearchParams(window.location.search);
    for (const key of ["country", "emirate", "page"]) params.delete(key);
    startTransition(() => {
      router.replace(
        { pathname, query: Object.fromEntries(params) },
        { scroll: false },
      );
      router.refresh();
    });
  }

  const options: { value: GccCode | typeof ALL; label: string; sub?: string }[] = [
    ...countries.map((code) => ({
      value: code,
      label: nameOf(code),
      sub: gccByCode(code)!.currency,
    })),
    { value: ALL, label: t("all"), sub: t("allHint") },
  ];
  const active = selected ?? ALL;

  if (variant === "list") {
    return (
      <div role="radiogroup" aria-label={t("label")} className="flex flex-col gap-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active === o.value}
            onClick={() => choose(o.value)}
            className={cn(
              "flex min-h-12 items-center gap-3 rounded-2xl px-3 text-start text-[0.95rem] font-medium transition-colors active:scale-[0.98]",
              active === o.value ? "bg-accent/10" : "hover:bg-muted",
            )}
          >
            <span className="flex-1">
              {o.label}
              {o.sub && (
                <span className="ms-2 text-xs font-normal text-muted-foreground">
                  {o.sub}
                </span>
              )}
            </span>
            {active === o.value && <Check className="size-4 text-accent" aria-hidden />}
          </button>
        ))}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${t("change")}: ${currentLabel}`}
        disabled={pending}
        className="inline-flex h-10 items-center gap-1.5 rounded-full border bg-background/60 px-3.5 text-sm font-semibold transition-all hover:border-accent hover:bg-accent/10 active:scale-95 disabled:opacity-60 md:h-9"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Globe className="size-4 text-accent" aria-hidden />
        )}
        {currentLabel}
        <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        {options.map((o) => (
          <DropdownMenuItem
            key={o.value}
            onClick={() => choose(o.value)}
            className="min-h-10 gap-2"
          >
            <span className="flex-1">{o.label}</span>
            {o.sub && (
              <span className="text-xs text-muted-foreground">{o.sub}</span>
            )}
            {active === o.value && <Check className="size-4 text-accent" aria-hidden />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
