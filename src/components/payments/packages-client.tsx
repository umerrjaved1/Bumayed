"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function PackagesClient({
  packages,
}: {
  packages: Array<{
    id: string;
    name: string;
    nameAr: string | null;
    priceAed: number;
    validityDays: number;
    featuredSlots: number;
    monthlyListingQuota: number | null;
  }>;
}) {
  const t = useTranslations("packages");
  const locale = useLocale();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function buy(packageId: string) {
    setBusy(packageId);
    try {
      const res = await fetch("/api/packages/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body?.error?.message ?? t("error"));
        return;
      }
      router.push(body.checkoutPath);
    } finally {
      setBusy(null);
    }
  }

  return (
    <ul className="space-y-3">
      {packages.map((p) => (
        <li
          key={p.id}
          className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-medium">{locale === "ar" && p.nameAr ? p.nameAr : p.name}</p>
            <p className="text-sm text-muted-foreground">
              AED {p.priceAed.toLocaleString()} · {p.validityDays} {t("days")} ·{" "}
              {t("slots", { count: p.featuredSlots })}
              {p.monthlyListingQuota == null
                ? ` · ${t("unlimited")}`
                : ` · ${t("quota", { count: p.monthlyListingQuota })}`}
            </p>
          </div>
          <Button disabled={busy === p.id} onClick={() => void buy(p.id)}>
            {t("buy")}
          </Button>
        </li>
      ))}
    </ul>
  );
}
