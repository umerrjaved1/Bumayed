"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type AdminDealerRow = {
  id: string;
  businessName: string;
  status: string;
  email: string | null;
  phone: string;
  location: string;
  note: string | null;
};

export function DealersTable({
  initialItems,
  canVerify,
}: {
  initialItems: AdminDealerRow[];
  canVerify: boolean;
}) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [pending, startTransition] = useTransition();

  async function reload() {
    const res = await fetch("/api/admin/dealers");
    if (!res.ok) {
      toast.error(t("errorGeneric"));
      return;
    }
    const data = await res.json();
    setItems(
      (data.items as Array<Record<string, unknown>>).map(mapDealerRow),
    );
  }

  async function verify(id: string, status: "APPROVED" | "REJECTED" | "PENDING") {
    const res = await fetch(`/api/admin/dealers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        note: status === "REJECTED" ? "Rejected by admin" : undefined,
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      toast.error(body?.error?.message ?? t("errorGeneric"));
      return;
    }
    toast.success(t("dealerVerifyOk"));
    startTransition(() => {
      void reload().then(() => router.refresh());
    });
  }

  return (
    <ul className="divide-y rounded-lg border">
      {items.length === 0 ? (
        <li className="p-8 text-center text-muted-foreground">
          {t("emptyDealers")}
        </li>
      ) : (
        items.map((d) => (
          <li
            key={d.id}
            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{d.businessName}</span>
                <Badge variant="secondary">{d.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {d.email ?? d.phone} · {d.location || "—"}
              </p>
              {d.note ? (
                <p className="text-sm text-muted-foreground">{d.note}</p>
              ) : null}
            </div>
            {canVerify ? (
              <div className="flex flex-wrap gap-2">
                {d.status !== "APPROVED" ? (
                  <Button
                    size="sm"
                    disabled={pending}
                    onClick={() => void verify(d.id, "APPROVED")}
                  >
                    {t("approve")}
                  </Button>
                ) : null}
                {d.status !== "REJECTED" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => void verify(d.id, "REJECTED")}
                  >
                    {t("reject")}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </li>
        ))
      )}
    </ul>
  );
}

export function mapDealerRow(row: Record<string, unknown>): AdminDealerRow {
  const user = row.user as
    | { email?: string | null; phone?: string | null }
    | undefined;
  const emirate = row.emirate as { nameEn?: string } | null | undefined;
  const city = row.city as { nameEn?: string } | null | undefined;
  return {
    id: String(row.id),
    businessName: String(row.businessName),
    status: String(row.verificationStatus),
    email: (row.businessEmail as string | null) ?? user?.email ?? null,
    phone: String(row.businessPhone ?? user?.phone ?? ""),
    location: [city?.nameEn, emirate?.nameEn].filter(Boolean).join(", "),
    note: (row.verificationNote as string | null) ?? null,
  };
}
