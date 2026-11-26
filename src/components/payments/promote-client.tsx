"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function PromoteClient({
  listingId,
  offers,
}: {
  listingId: string;
  offers: Array<{ type: string; priceAed: number; durationDays: number }>;
}) {
  const t = useTranslations("promote");
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function buy(type: string) {
    setBusy(type);
    try {
      const res = await fetch("/api/promotions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, type }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body?.error?.message ?? t("error"));
        return;
      }
      if (body.appliedWithSlot) {
        toast.success(t("slotUsed"));
        router.push("/dashboard/listings");
        return;
      }
      router.push(body.checkoutPath);
    } finally {
      setBusy(null);
    }
  }

  return (
    <ul className="space-y-3">
      {offers.map((o) => (
        <li
          key={o.type}
          className="flex items-center justify-between rounded-lg border p-4"
        >
          <div>
            <p className="font-medium">{t(`types.${o.type}`)}</p>
            <p className="text-sm text-muted-foreground">
              AED {o.priceAed.toLocaleString("en-AE")} · {o.durationDays} {t("days")}
            </p>
          </div>
          <Button disabled={busy === o.type} onClick={() => void buy(o.type)}>
            {t("buy")}
          </Button>
        </li>
      ))}
    </ul>
  );
}
