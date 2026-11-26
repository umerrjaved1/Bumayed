"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { startNavigationProgress } from "@/components/layout/navigation-progress";
import type {
  ListingQuery,
  VehicleCategoryCode,
} from "@/modules/listings/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMIRATES = ["AUH", "DXB", "SHJ", "AJM", "UAQ", "RAK", "FUJ"] as const;
const TRANSMISSIONS = ["automatic", "manual"] as const;
const FUEL_TYPES = ["petrol", "diesel", "hybrid", "electric"] as const;
const REGIONAL_SPECS = ["gcc", "american", "european", "japanese"] as const;
const MOTO_TYPES = [
  "sport",
  "cruiser",
  "touring",
  "adventure",
  "scooter",
] as const;
const BOAT_TYPES = [
  "yacht",
  "fishing",
  "speedboat",
  "jetski",
  "sailboat",
] as const;

type FilterFormProps = {
  category: VehicleCategoryCode;
  makes: string[];
  values: ListingQuery;
  onApplied?: () => void; // closes the mobile drawer
};

export function FilterForm({
  category,
  makes,
  values,
  onApplied,
}: FilterFormProps) {
  const t = useTranslations("filters");
  const te = useTranslations("emirates");
  const router = useRouter();
  const pathname = usePathname();

  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    keyword: values.keyword ?? "",
    make: values.make ?? "",
    priceMin: values.priceMin?.toString() ?? "",
    priceMax: values.priceMax?.toString() ?? "",
    yearMin: values.yearMin?.toString() ?? "",
    yearMax: values.yearMax?.toString() ?? "",
    mileageMax: values.mileageMax?.toString() ?? "",
    emirate: values.emirate ?? "",
    condition: values.condition ?? "",
    sellerType: values.sellerType ?? "",
    transmission: values.transmission ?? "",
    fuelType: values.fuelType ?? "",
    regionalSpec: values.regionalSpec ?? "",
    motoType: values.motoType ?? "",
    boatType: values.boatType ?? "",
  });

  function set(key: keyof typeof form) {
    return (value: string) => setForm((f) => ({ ...f, [key]: value }));
  }

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(form)) {
      if (value) params.set(key, value);
    }
    if (values.sort !== "newest") params.set("sort", values.sort);
    startNavigationProgress();
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
    onApplied?.();
  }

  function reset() {
    startNavigationProgress();
    startTransition(() => router.push(pathname));
    onApplied?.();
  }

  const hasMileage = category !== "boats";

  return (
    <form onSubmit={apply} className="flex flex-col gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="f-keyword">{t("keyword")}</Label>
        <Input
          id="f-keyword"
          value={form.keyword}
          onChange={(e) => set("keyword")(e.target.value)}
          placeholder={t("keywordPlaceholder")}
        />
      </div>

      {makes.length > 0 && (
        <FilterSelect
          id="f-make"
          label={t("make")}
          value={form.make}
          anyLabel={t("allMakes")}
          onChange={set("make")}
          options={makes.map((m) => ({ value: m, label: m }))}
        />
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="f-priceMin">{t("priceMin")}</Label>
          <Input
            id="f-priceMin"
            inputMode="numeric"
            value={form.priceMin}
            onChange={(e) => set("priceMin")(e.target.value.replace(/\D/g, ""))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-priceMax">{t("priceMax")}</Label>
          <Input
            id="f-priceMax"
            inputMode="numeric"
            value={form.priceMax}
            onChange={(e) => set("priceMax")(e.target.value.replace(/\D/g, ""))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-yearMin">{t("yearMin")}</Label>
          <Input
            id="f-yearMin"
            inputMode="numeric"
            value={form.yearMin}
            onChange={(e) => set("yearMin")(e.target.value.replace(/\D/g, ""))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-yearMax">{t("yearMax")}</Label>
          <Input
            id="f-yearMax"
            inputMode="numeric"
            value={form.yearMax}
            onChange={(e) => set("yearMax")(e.target.value.replace(/\D/g, ""))}
          />
        </div>
      </div>

      {hasMileage && (
        <div className="space-y-1.5">
          <Label htmlFor="f-mileageMax">{t("mileageMax")}</Label>
          <Input
            id="f-mileageMax"
            inputMode="numeric"
            value={form.mileageMax}
            onChange={(e) =>
              set("mileageMax")(e.target.value.replace(/\D/g, ""))
            }
          />
        </div>
      )}

      <FilterSelect
        id="f-emirate"
        label={t("emirate")}
        value={form.emirate}
        anyLabel={t("allEmirates")}
        onChange={set("emirate")}
        options={EMIRATES.map((c) => ({ value: c, label: te(c) }))}
      />

      <FilterSelect
        id="f-condition"
        label={t("condition")}
        value={form.condition}
        anyLabel={t("any")}
        onChange={set("condition")}
        options={[
          { value: "new", label: t("new") },
          { value: "used", label: t("used") },
        ]}
      />

      <FilterSelect
        id="f-sellerType"
        label={t("sellerType")}
        value={form.sellerType}
        anyLabel={t("any")}
        onChange={set("sellerType")}
        options={[
          { value: "individual", label: t("individual") },
          { value: "dealer", label: t("dealer") },
        ]}
      />

      {category === "cars" && (
        <>
          <Separator />
          <FilterSelect
            id="f-transmission"
            label={t("transmission")}
            value={form.transmission}
            anyLabel={t("any")}
            onChange={set("transmission")}
            options={TRANSMISSIONS.map((v) => ({ value: v, label: t(v) }))}
          />
          <FilterSelect
            id="f-fuelType"
            label={t("fuelType")}
            value={form.fuelType}
            anyLabel={t("any")}
            onChange={set("fuelType")}
            options={FUEL_TYPES.map((v) => ({ value: v, label: t(v) }))}
          />
          <FilterSelect
            id="f-regionalSpec"
            label={t("regionalSpec")}
            value={form.regionalSpec}
            anyLabel={t("any")}
            onChange={set("regionalSpec")}
            options={REGIONAL_SPECS.map((v) => ({ value: v, label: t(v) }))}
          />
        </>
      )}

      {category === "motorcycles" && (
        <FilterSelect
          id="f-motoType"
          label={t("motoType")}
          value={form.motoType}
          anyLabel={t("any")}
          onChange={set("motoType")}
          options={MOTO_TYPES.map((v) => ({ value: v, label: t(v) }))}
        />
      )}

      {category === "boats" && (
        <FilterSelect
          id="f-boatType"
          label={t("boatType")}
          value={form.boatType}
          anyLabel={t("any")}
          onChange={set("boatType")}
          options={BOAT_TYPES.map((v) => ({ value: v, label: t(v) }))}
        />
      )}

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {t("apply")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={reset}
          disabled={pending}
        >
          {t("reset")}
        </Button>
      </div>
    </form>
  );
}

function FilterSelect({
  id,
  label,
  value,
  anyLabel,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  anyLabel: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={(v) => onChange(v ?? "")}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={anyLabel}>
            {(v: string) =>
              options.find((o) => o.value === v)?.label ?? anyLabel
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">{anyLabel}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
