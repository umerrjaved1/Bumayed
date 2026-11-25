"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/navigation";

export type AdminReportRow = {
  id: string;
  reason: string;
  details: string | null;
  status: string;
  listingTitle: string;
  listingSlug: string;
  createdAt: string;
};

export function ReportsQueue({
  initialItems,
}: {
  initialItems: AdminReportRow[];
}) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [resolution, setResolution] = useState("");
  const [pending, startTransition] = useTransition();

  async function reload() {
    const res = await fetch("/api/admin/reports?status=OPEN");
    if (!res.ok) {
      toast.error(t("errorGeneric"));
      return;
    }
    const data = await res.json();
    setItems((data.items as Array<Record<string, unknown>>).map(mapReportRow));
  }

  async function resolve(id: string, status: "RESOLVED" | "DISMISSED") {
    if (resolution.trim().length < 3) {
      toast.error(t("resolutionRequired"));
      return;
    }
    const res = await fetch(`/api/admin/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, resolution: resolution.trim() }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      toast.error(body?.error?.message ?? t("errorGeneric"));
      return;
    }
    toast.success(t("reportResolveOk"));
    setActiveId(null);
    setResolution("");
    startTransition(() => {
      void reload().then(() => router.refresh());
    });
  }

  return (
    <ul className="divide-y rounded-lg border">
      {items.length === 0 ? (
        <li className="p-8 text-center text-muted-foreground">
          {t("emptyReports")}
        </li>
      ) : (
        items.map((r) => (
          <li key={r.id} className="space-y-2 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{r.status}</Badge>
              <span className="font-medium">{r.reason}</span>
              <Link
                href={`/listings/${r.listingSlug}`}
                className="text-sm text-primary hover:underline"
              >
                {r.listingTitle}
              </Link>
            </div>
            {r.details ? (
              <p className="text-sm text-muted-foreground">{r.details}</p>
            ) : null}
            {activeId === r.id ? (
              <div className="space-y-2">
                <Textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  rows={2}
                  placeholder={t("resolutionPlaceholder")}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={pending}
                    onClick={() => void resolve(r.id, "RESOLVED")}
                  >
                    {t("resolve")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => void resolve(r.id, "DISMISSED")}
                  >
                    {t("dismiss")}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setActiveId(null);
                      setResolution("");
                    }}
                  >
                    {t("cancel")}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveId(r.id)}
              >
                {t("reviewReport")}
              </Button>
            )}
          </li>
        ))
      )}
    </ul>
  );
}

export function mapReportRow(row: Record<string, unknown>): AdminReportRow {
  const listing = row.listing as
    { title?: string; slug?: string } | null | undefined;
  return {
    id: String(row.id),
    reason: String(row.reason),
    details: (row.details as string | null) ?? null,
    status: String(row.status),
    listingTitle: listing?.title ?? "—",
    listingSlug: listing?.slug ?? "",
    createdAt: String(row.createdAt),
  };
}
