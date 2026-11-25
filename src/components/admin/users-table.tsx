"use client";

import { type AdminUserRow, mapUserRow } from "./row-mappers";
import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export function UsersTable({
  initialItems,
  canSuspend,
}: {
  initialItems: AdminUserRow[];
  canSuspend: boolean;
}) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [q, setQ] = useState("");
  const [pending, startTransition] = useTransition();

  async function search() {
    const res = await fetch(
      `/api/admin/users?q=${encodeURIComponent(q.trim())}`,
    );
    if (!res.ok) {
      toast.error(t("errorGeneric"));
      return;
    }
    const data = await res.json();
    setItems((data.items as Array<Record<string, unknown>>).map(mapUserRow));
  }

  async function setStatus(
    id: string,
    status: "ACTIVE" | "SUSPENDED" | "BLOCKED",
  ) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      toast.error(body?.error?.message ?? t("errorGeneric"));
      return;
    }
    toast.success(t("userStatusOk"));
    startTransition(() => {
      void search().then(() => router.refresh());
    });
  }

  return (
    <div className="space-y-4">
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void search();
        }}
      >
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("userSearchPlaceholder")}
          className="max-w-sm"
        />
        <Button type="submit" disabled={pending}>
          {t("search")}
        </Button>
      </form>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b bg-muted/40 text-start">
            <tr>
              <th className="px-3 py-2 text-start font-medium">
                {t("colName")}
              </th>
              <th className="px-3 py-2 text-start font-medium">
                {t("colRole")}
              </th>
              <th className="px-3 py-2 text-start font-medium">
                {t("colStatus")}
              </th>
              <th className="px-3 py-2 text-start font-medium">
                {t("colListings")}
              </th>
              {canSuspend ? (
                <th className="px-3 py-2 text-start font-medium">
                  {t("colActions")}
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="px-3 py-2">
                  <div className="font-medium">{u.displayName}</div>
                  <div className="text-muted-foreground">
                    {u.email ?? u.phone ?? "—"}
                  </div>
                </td>
                <td className="px-3 py-2">{u.role}</td>
                <td className="px-3 py-2">
                  <Badge variant="secondary">{u.status}</Badge>
                </td>
                <td className="px-3 py-2">{u.listingsCount}</td>
                {canSuspend ? (
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {u.status !== "ACTIVE" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={pending}
                          onClick={() => void setStatus(u.id, "ACTIVE")}
                        >
                          {t("activate")}
                        </Button>
                      ) : null}
                      {u.status !== "SUSPENDED" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={pending}
                          onClick={() => void setStatus(u.id, "SUSPENDED")}
                        >
                          {t("suspend")}
                        </Button>
                      ) : null}
                      {u.status !== "BLOCKED" ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={pending}
                          onClick={() => void setStatus(u.id, "BLOCKED")}
                        >
                          {t("block")}
                        </Button>
                      ) : null}
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export type { AdminUserRow };
