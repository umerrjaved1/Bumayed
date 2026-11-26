"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Search } from "lucide-react";
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

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl bg-card p-2 text-card-foreground shadow-lg"
    >
      <div
        role="radiogroup"
        aria-label={t("search")}
        className="mb-2 grid grid-cols-3 gap-1 rounded-lg bg-muted p-1"
      >
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={category === c}
            onClick={() => setCategory(c)}
            className={`h-9 rounded-md text-sm font-medium transition-colors ${
              category === c
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tn(c)}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={t("searchPlaceholder")}
          enterKeyHint="search"
          aria-label={t("search")}
          className="h-11 flex-1 border-0 bg-transparent text-card-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-1"
        />
        <Select value={emirate} onValueChange={(v) => setEmirate(v ?? "")}>
          <SelectTrigger
            className="h-11 bg-transparent text-card-foreground sm:w-48"
            aria-label={t("allEmirates")}
          >
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
        <Button type="submit" size="lg" className="h-11" disabled={pending}>
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
