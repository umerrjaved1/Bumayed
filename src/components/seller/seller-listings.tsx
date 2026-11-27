"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/shared/price-display";
import { EmptyState } from "@/components/shared/empty-state";
import { Megaphone } from "lucide-react";
import type { ListingPublicDto } from "@/modules/listings/types";

const TABS = [
  "ALL",
  "DRAFT",
  "PENDING",
  "ACTIVE",
  "REJECTED",
  "PAUSED",
  "SOLD",
  "EXPIRED",
] as const;

export function SellerListings() {
  const t = useTranslations("sellerListings");
  const td = useTranslations("dashboard");
  const [tab, setTab] = useState<(typeof TABS)[number]>("ALL");
  const [items, setItems] = useState<ListingPublicDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const load = useCallback(
    (status: (typeof TABS)[number]) => {
      startTransition(async () => {
        setError(null);
        try {
          const q = status === "ALL" ? "" : `?status=${status}`;
          const res = await fetch(`/api/seller/listings${q}`);
          const data = await res.json();
          if (!res.ok) {
            setError(data?.error?.message ?? t("error"));
            setItems([]);
            return;
          }
          setItems(data.items ?? []);
        } catch {
          setError(t("error"));
          setItems([]);
        }
      });
    },
    [t],
  );

  // Initial load runs on the client only; tab changes call load() directly.
  useEffect(() => {
    load("ALL");
  }, [load]);

  async function act(id: string, action: string) {
    setError(null);
    const res = await fetch(`/api/seller/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error?.message ?? t("error"));
      return;
    }
    load(tab);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <Button render={<Link href="/dashboard/listings/new" />}>
          {t("new")}
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={tab === s ? "default" : "outline"}
            onClick={() => {
              setTab(s);
              load(s);
            }}
          >
            {t(`tabs.${s}`)}
          </Button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <ul className="mt-6 space-y-3">
        {(items ?? []).map((l) => (
          <li
            key={l.id}
            className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{l.title}</p>
                <Badge variant="secondary">{l.category}</Badge>
              </div>
              <PriceDisplay amountAed={l.priceAed} className="text-sm" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                render={<Link href={`/listings/${l.slug}`} />}
              >
                {t("view")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                render={<Link href={`/dashboard/listings/${l.id}/promote`} />}
              >
                {t("promote")}
              </Button>
              {(
                [
                  ["submit", "actions.submit"],
                  ["pause", "actions.pause"],
                  ["reactivate", "actions.reactivate"],
                  ["renew", "actions.renew"],
                  ["sold", "actions.sold"],
                  ["remove", "actions.remove"],
                ] as const
              ).map(([action, label]) => (
                <Button
                  key={action}
                  size="sm"
                  variant={action === "remove" ? "destructive" : "outline"}
                  disabled={pending}
                  onClick={() => act(l.id, action)}
                >
                  {t(label)}
                </Button>
              ))}
            </div>
          </li>
        ))}
      </ul>

      {!pending && items?.length === 0 && (
        <div className="mt-8">
          <EmptyState
            icon={Megaphone}
            title={td("listingsEmptyTitle")}
            body={td("listingsEmptyBody")}
            actionLabel={td("postAd")}
            actionHref="/dashboard/listings/new"
          />
        </div>
      )}
    </div>
  );
}
