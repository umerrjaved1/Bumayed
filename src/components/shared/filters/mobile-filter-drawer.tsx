"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FilterForm } from "./filter-form";
import type { ListingQuery, VehicleCategoryCode } from "@/modules/listings/types";

/** Mobile filters live in a drawer (playbook §6.2); desktop uses the sidebar. */
export function MobileFilterDrawer(props: {
  category: VehicleCategoryCode;
  makes: string[];
  values: ListingQuery;
}) {
  const t = useTranslations("filters");
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" className="lg:hidden" aria-label={t("showFilters")} />
        }
      >
        <SlidersHorizontal className="size-4" aria-hidden />
        {t("title")}
      </SheetTrigger>
      <SheetContent side="left" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-start">{t("title")}</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-6">
          <FilterForm {...props} onApplied={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
