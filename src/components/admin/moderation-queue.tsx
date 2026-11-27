"use client";

import { type AdminListingRow, mapListingRow } from "./row-mappers";
import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "@/i18n/navigation";

export function ModerationQueue({
  initialItems,
  initialStatus,
}: {
  initialItems: AdminListingRow[];
  initialStatus: string;
}) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus || "PENDING");
  const [items, setItems] = useState(initialItems);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();

  async function reload(nextStatus: string) {
    const res = await fetch(
      `/api/admin/listings?status=${encodeURIComponent(nextStatus)}`,
    );
    if (!res.ok) {
      toast.error(t("errorGeneric"));
      return;
    }
    const data = await res.json();
    setItems((data.items as Array<Record<string, unknown>>).map(mapListingRow));
  }

  async function act(
    id: string,
    action: "approve" | "reject" | "remove" | "feature",
    extra?: { reason?: string },
  ) {
    const res = await fetch(`/api/admin/listings/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      toast.error(body?.error?.message ?? t("errorGeneric"));
      return;
    }
    toast.success(t(`listingActionOk.${action}`));
    setRejectId(null);
    setReason("");
    startTransition(() => {
      void reload(status).then(() => router.refresh());
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={status}
          onValueChange={(v) => {
            const next = v ?? "PENDING";
            setStatus(next);
            startTransition(() => {
              void reload(next);
            });
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[
              "PENDING",
              "ACTIVE",
              "REJECTED",
              "PAUSED",
              "EXPIRED",
              "SOLD",
              "REMOVED",
            ].map((s) => (
              <SelectItem key={s} value={s}>
                {t(`listingStatus.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          {t("listingCount", { count: items.length })}
        </p>
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          {t("emptyListings")}
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {items.map((item) => (
            <li key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row">
              <div className="h-20 w-28 shrink-0 overflow-hidden rounded bg-muted">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/listings/${item.slug}`}
                    className="font-medium hover:underline"
                  >
                    {item.title}
                  </Link>
                  <Badge variant="secondary">{item.status}</Badge>
                  {item.openReports > 0 ? (
                    <Badge variant="destructive">
                      {t("openReports", { count: item.openReports })}
                    </Badge>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  {item.category} · {item.location} · {item.currency}{" "}
                  {item.price.toLocaleString("en-AE")} · {item.sellerName}
                </p>
                {item.rejectionReason ? (
                  <p className="text-sm text-destructive">
                    {item.rejectionReason}
                  </p>
                ) : null}
                {rejectId === item.id ? (
                  <div className="mt-2 space-y-2">
                    <Textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder={t("rejectReasonPlaceholder")}
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={pending || reason.trim().length < 3}
                        onClick={() =>
                          void act(item.id, "reject", { reason: reason.trim() })
                        }
                      >
                        {t("confirmReject")}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setRejectId(null);
                          setReason("");
                        }}
                      >
                        {t("cancel")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.status === "PENDING" ? (
                      <>
                        <Button
                          size="sm"
                          disabled={pending}
                          onClick={() => void act(item.id, "approve")}
                        >
                          {t("approve")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={pending}
                          onClick={() => setRejectId(item.id)}
                        >
                          {t("reject")}
                        </Button>
                      </>
                    ) : null}
                    {item.status === "ACTIVE" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pending}
                        onClick={() => void act(item.id, "feature")}
                      >
                        {t("feature")}
                      </Button>
                    ) : null}
                    {item.status !== "REMOVED" ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={pending}
                        onClick={() => void act(item.id, "remove")}
                      >
                        {t("remove")}
                      </Button>
                    ) : null}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export type { AdminListingRow };
