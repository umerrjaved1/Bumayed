"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMIRATE_CODES = ["AUH", "DXB", "SHJ", "AJM", "UAQ", "RAK", "FUJ"] as const;

export function SearchBar() {
  const t = useTranslations("common");
  const te = useTranslations("emirates");
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [emirate, setEmirate] = useState<string>("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Phase 2 wires the full filter set; keyword + emirate are the first
    // URL query params (filters must live in the URL, playbook §6.2).
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("keyword", keyword.trim());
    if (emirate) params.set("emirate", emirate);
    router.push(`/cars?${params.toString()}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-2 rounded-lg bg-card p-2 shadow-lg sm:flex-row"
    >
      <Input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder={t("searchPlaceholder")}
        aria-label={t("search")}
        className="h-11 flex-1 border-0 shadow-none focus-visible:ring-1"
      />
      <Select value={emirate} onValueChange={(v) => setEmirate(v ?? "")}>
        <SelectTrigger className="h-11 sm:w-48" aria-label={t("allEmirates")}>
          <SelectValue placeholder={t("allEmirates")} />
        </SelectTrigger>
        <SelectContent>
          {EMIRATE_CODES.map((code) => (
            <SelectItem key={code} value={code}>
              {te(code)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" size="lg" className="h-11">
        <Search className="size-4" aria-hidden />
        {t("search")}
      </Button>
    </form>
  );
}
