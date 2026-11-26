"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Car, CircleGauge, Loader2, MapPin, Search, Ship } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
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
const CATEGORIES = ["cars", "motorcycles", "boats"] as const;
type Category = (typeof CATEGORIES)[number];
const CATEGORY_ICONS = { cars: Car, motorcycles: CircleGauge, boats: Ship };

export function SearchBar() {
  const t = useTranslations("common");
  const te = useTranslations("emirates");
  const tn = useTranslations("nav");
  const router = useRouter();
  const [category, setCategory] = useState<Category>("cars");
  const [pending, startTransition] = useTransition();
  const [keyword, setKeyword] = useState("");
  const [emirate, setEmirate] = useState<string>("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Phase 2 wires the full filter set; keyword + emirate are the first
    // URL query params (filters must live in the URL, playbook §6.2).
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("keyword", keyword.trim());
    if (emirate) params.set("emirate", emirate);
    const qs = params.toString();
    startNavigationProgress();
    startTransition(() =>
      router.push(qs ? `/${category}?${qs}` : `/${category}`),
    );
  }

  const activeIndex = CATEGORIES.indexOf(category);

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl bg-card/95 p-2 text-card-foreground shadow-[0_30px_80px_-30px_oklch(0.1_0.05_258/0.8)] ring-1 ring-white/20 backdrop-blur-xl sm:p-2.5"
    >
      <div
        role="radiogroup"
        aria-label={t("search")}
        className="relative mb-2 grid grid-cols-3 rounded-xl bg-muted p-1"
      >
        {/* Sliding selection pill */}
        <span
          aria-hidden
          className="absolute inset-y-1 start-1 w-[calc((100%-0.5rem)/3)] rounded-lg bg-background shadow-sm ring-1 ring-foreground/5 transition-transform duration-500 ease-[var(--ease-spring)]"
          style={{
            transform: `translateX(calc(${activeIndex * 100}% * var(--dir, 1)))`,
          }}
        />
        {CATEGORIES.map((c) => {
          const Icon = CATEGORY_ICONS[c];
          return (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={category === c}
              onClick={() => setCategory(c)}
              className={`relative z-10 inline-flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors duration-300 ${
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
        <div className="hidden h-8 w-px bg-border sm:block" aria-hidden />
        <Select value={emirate} onValueChange={(v) => setEmirate(v ?? "")}>
          <SelectTrigger
            className="h-12 rounded-xl border-0 bg-transparent text-card-foreground shadow-none hover:bg-muted/60 data-[size=default]:h-12 sm:w-52"
            aria-label={t("allEmirates")}
          >
            <MapPin className="size-4 text-accent" aria-hidden />
            <SelectValue placeholder={t("allEmirates")}>
              {(v: string) =>
                v ? te(v as (typeof EMIRATE_CODES)[number]) : t("allEmirates")
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {EMIRATE_CODES.map((code) => (
              <SelectItem key={code} value={code}>
                {te(code)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
  );
}
