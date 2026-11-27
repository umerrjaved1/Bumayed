"use client";

import { useEffect, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Car,
  CircleGauge,
  Hash,
  History,
  Loader2,
  MapPin,
  Search,
  Ship,
  TrendingUp,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { startNavigationProgress } from "@/components/layout/navigation-progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMIRATE_CODES = [
  "AUH",
  "DXB",
  "SHJ",
  "AJM",
  "UAQ",
  "RAK",
  "FUJ",
] as const;
const CATEGORIES = ["cars", "motorcycles", "boats", "plates"] as const;
type Category = (typeof CATEGORIES)[number];
const CATEGORY_ICONS = {
  cars: Car,
  motorcycles: CircleGauge,
  boats: Ship,
  plates: Hash,
};

/** Recent searches stay in this browser only (localStorage). */
type RecentSearch = { category: Category; keyword: string; emirate: string };
const RECENT_KEY = "bumayed:recent-searches";

function readRecent(): RecentSearch[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as RecentSearch[]).slice(0, 4) : [];
  } catch {
    return [];
  }
}

function saveRecent(entry: RecentSearch) {
  try {
    const same = (r: RecentSearch) =>
      r.category === entry.category &&
      r.keyword.toLowerCase() === entry.keyword.toLowerCase() &&
      r.emirate === entry.emirate;
    const next = [entry, ...readRecent().filter((r) => !same(r))].slice(0, 4);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* storage blocked: skip */
  }
}

function recentHref(r: RecentSearch) {
  const params = new URLSearchParams();
  if (r.keyword) params.set("keyword", r.keyword);
  if (r.emirate) params.set("emirate", r.emirate);
  const qs = params.toString();
  return qs ? `/${r.category}?${qs}` : `/${r.category}`;
}

/**
 * Hero search. `popular` (makes with live ads) and the visitor's own recent
 * searches show as one-tap chips underneath, so nobody faces an empty box.
 */
export function SearchBar({
  popular = [],
  regions = [],
  country,
  showPlates = true,
}: {
  popular?: string[];
  /** Regions of the browsed country for the dropdown (none = hide it). */
  regions?: { code: string; nameEn: string; nameAr: string }[];
  country?: string;
  /** Number plates only exist for the UAE. */
  showPlates?: boolean;
}) {
  const locale = useLocale();
  const t = useTranslations("common");
  const te = useTranslations("emirates");
  const tn = useTranslations("nav");
  const router = useRouter();
  const [category, setCategory] = useState<Category>("cars");
  const [pending, startTransition] = useTransition();
  /** Name of a region code: from the loaded list, else the UAE emirate names. */
  function regionName(code: string): string {
    const r = regions.find((x) => x.code === code);
    if (r) return locale === "ar" ? r.nameAr : r.nameEn;
    return (EMIRATE_CODES as readonly string[]).includes(code)
      ? te(code as (typeof EMIRATE_CODES)[number])
      : code;
  }
  const regionPlaceholder =
    country === "AE" ? t("allEmirates") : t("allRegions");
  const [keyword, setKeyword] = useState("");
  const [emirate, setEmirate] = useState<string>("");
  const [recent, setRecent] = useState<RecentSearch[]>([]);

  useEffect(() => {
    const id = window.setTimeout(() => setRecent(readRecent()), 0);
    return () => window.clearTimeout(id);
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Phase 2 wires the full filter set; keyword + emirate are the first
    // URL query params (filters must live in the URL, playbook §6.2).
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("keyword", keyword.trim());
    if (emirate) params.set("emirate", emirate);
    const qs = params.toString();
    if (keyword.trim() || emirate) {
      saveRecent({ category, keyword: keyword.trim(), emirate });
    }
    startNavigationProgress();
    startTransition(() =>
      router.push(qs ? `/${category}?${qs}` : `/${category}`),
    );
  }

  const categories = CATEGORIES.filter((c) => c !== "plates" || showPlates);
  const activeIndex = Math.max(0, categories.indexOf(category));

  const chips =
    recent.length > 0 || popular.length > 0 ? (
      <div className="-mx-4 mt-3 scrollbar-none flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {recent.length > 0 && (
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-white/55">
            <History className="size-3.5" aria-hidden />
            {t("recentSearches")}
          </span>
        )}
        {recent.map((r) => (
          <Link
            key={recentHref(r)}
            href={recentHref(r)}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 text-sm font-medium text-white transition-colors hover:bg-white/20 active:scale-95"
          >
            {r.keyword || tn(r.category)}
            {r.emirate && (
              <span className="text-white/60">· {regionName(r.emirate)}</span>
            )}
          </Link>
        ))}
        {popular.length > 0 && (
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-white/55 sm:ms-2">
            <TrendingUp className="size-3.5" aria-hidden />
            {t("popularSearches")}
          </span>
        )}
        {popular.slice(0, 6).map((make) => (
          <Link
            key={make}
            href={`/cars?make=${encodeURIComponent(make)}`}
            className="inline-flex h-10 shrink-0 items-center rounded-full border border-white/10 bg-white/5 px-3 text-sm text-white/85 transition-colors hover:border-accent/60 hover:text-white active:scale-95"
          >
            {make}
          </Link>
        ))}
      </div>
    ) : null;

  return (
    <div>
      <form
        onSubmit={onSubmit}
        className="rounded-2xl bg-card/95 p-2 text-card-foreground shadow-[0_30px_80px_-30px_oklch(0.1_0.05_258/0.8)] ring-1 ring-white/20 backdrop-blur-xl sm:p-2.5"
      >
        <div
          role="radiogroup"
          aria-label={t("search")}
          className="relative mb-2 grid rounded-xl bg-muted p-1"
          style={{
            gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))`,
          }}
        >
          {/* Sliding selection pill */}
          <span
            aria-hidden
            className="absolute inset-y-1 start-1 rounded-lg bg-background shadow-sm ring-1 ring-foreground/5 transition-transform duration-500 ease-[var(--ease-spring)]"
            style={{
              width: `calc((100% - 0.5rem) / ${categories.length})`,
              transform: `translateX(calc(${activeIndex * 100}% * var(--dir, 1)))`,
            }}
          />
          {categories.map((c) => {
            const Icon = CATEGORY_ICONS[c];
            return (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={category === c}
                onClick={() => setCategory(c)}
                className={`relative z-10 inline-flex h-10 items-center justify-center gap-1 rounded-lg px-1 text-xs font-semibold transition-colors duration-300 sm:gap-2 sm:text-sm ${
                  category === c
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon
                  className={`size-4 transition-all duration-300 ${category === c ? "scale-110 text-accent" : ""}`}
                  aria-hidden
                />
                {tn(c)}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="group/search relative flex flex-1 items-center">
            <Search
              className="pointer-events-none absolute start-3.5 size-5 text-muted-foreground transition-colors group-focus-within/search:text-accent"
              aria-hidden
            />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={t("searchPlaceholder")}
              enterKeyHint="search"
              aria-label={t("search")}
              className="h-12 flex-1 rounded-xl border-0 bg-transparent ps-11 text-base text-card-foreground shadow-none placeholder:text-muted-foreground focus-visible:bg-muted/60 focus-visible:ring-0"
            />
          </div>
          {regions.length > 0 && (
            <>
              <div className="hidden h-8 w-px bg-border sm:block" aria-hidden />
              <Select
                value={emirate}
                onValueChange={(v) => setEmirate(v ?? "")}
              >
                <SelectTrigger
                  className="h-12 rounded-xl border-0 bg-transparent text-card-foreground shadow-none hover:bg-muted/60 data-[size=default]:h-12 sm:w-52"
                  aria-label={regionPlaceholder}
                >
                  <MapPin className="size-4 text-accent" aria-hidden />
                  <SelectValue placeholder={regionPlaceholder}>
                    {(v: string) => (v ? regionName(v) : regionPlaceholder)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {regions.map((r) => (
                    <SelectItem key={r.code} value={r.code}>
                      {locale === "ar" ? r.nameAr : r.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
          <Button
            type="submit"
            variant="accent"
            size="xl"
            className="h-12 rounded-xl px-7 font-semibold"
            disabled={pending}
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Search className="size-4" aria-hidden />
            )}
            {t("search")}
          </Button>
        </div>
      </form>
      {chips}
    </div>
  );
}
