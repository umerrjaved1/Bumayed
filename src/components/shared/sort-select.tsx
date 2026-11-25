"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { ListingSort } from "@/modules/listings/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SORTS: ListingSort[] = [
  "newest",
  "priceAsc",
  "priceDesc",
  "mileageAsc",
  "yearDesc",
];

export function SortSelect({
  value,
  currentParams,
}: {
  value: ListingSort;
  /** Serialized current search params (filters preserved on sort change). */
  currentParams: Record<string, string>;
}) {
  const t = useTranslations("sort");
  const router = useRouter();
  const pathname = usePathname();

  function onChange(sort: string | null) {
    const params = new URLSearchParams(currentParams);
    if (sort && sort !== "newest") params.set("sort", sort);
    else params.delete("sort");
    params.delete("page"); // reset pagination on re-sort
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-52" aria-label={t("label")}>
        <SelectValue>{(v: ListingSort) => t(v)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {SORTS.map((s) => (
          <SelectItem key={s} value={s}>
            {t(s)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
