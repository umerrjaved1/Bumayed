"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FilterForm } from "./filter-form";
import type { ListingQuery, VehicleCategoryCode } from "@/modules/listings/types";

/**
 * Mobile filters live in a bottom sheet (playbook §6.2); desktop uses the
 * sidebar. The trigger shows how many filters are currently applied.
 */
export function MobileFilterDrawer({
  activeCount = 0,
  ...props
}: {
  category: VehicleCategoryCode;
  makes: string[];
  values: ListingQuery;
  activeCount?: number;
}) {
  const t = useTranslations("filters");
  const [open, setOpen] = useState(false);
  // Focus the sheet heading rather than the keyword box, so phones don't
  // pop the keyboard up over the filters the moment the sheet opens.
  const headingRef = useRef<HTMLHeadingElement>(null);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            className="relative h-10 shrink-0 rounded-xl px-3.5 font-semibold lg:hidden"
            aria-label={t("showFilters")}
          />
        }
      >
        <SlidersHorizontal className="size-4" aria-hidden />
        {t("title")}
        {activeCount > 0 && (
          <span className="grid min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[0.7rem] font-bold text-accent-foreground tabular-nums animate-in zoom-in-50">
            {activeCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent
        side="bottom"
        initialFocus={headingRef}
        className="max-h-[88dvh] gap-0 overflow-y-auto rounded-t-[1.75rem] pb-[env(safe-area-inset-bottom)]"
      >
        <div
          aria-hidden
          className="mx-auto mt-2.5 h-1.5 w-11 shrink-0 rounded-full bg-foreground/15"
        />
        <SheetHeader className="pt-3">
          <SheetTitle
            ref={headingRef}
            tabIndex={-1}
            className="text-start font-heading text-xl font-bold outline-none"
          >
            {t("title")}
          </SheetTitle>
          {activeCount > 0 && (
            <SheetDescription className="text-start">
              {t("activeCount", { count: activeCount })}
            </SheetDescription>
          )}
        </SheetHeader>
        <div className="px-4">
          <FilterForm {...props} onApplied={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
