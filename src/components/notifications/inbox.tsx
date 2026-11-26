"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Inbox({
  items,
}: {
  items: Array<{
    id: string;
    title: string;
    body: string;
    read: boolean;
    createdAt: string;
  }>;
}) {
  const [rows, setRows] = useState(items);

  async function mark(id: string) {
    const res = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => null);
    if (!res?.ok) return;
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, read: true } : r)));
  }

  if (rows.length === 0) {
    return <p className="text-muted-foreground">No notifications yet.</p>;
  }

  return (
    <ul className="divide-y rounded-lg border">
      {rows.map((n) => (
        <li key={n.id} className="space-y-1 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <p className={n.read ? "font-medium text-muted-foreground" : "font-medium"}>
              {n.title}
            </p>
            {!n.read ? (
              <Button size="sm" variant="ghost" onClick={() => void mark(n.id)}>
                Mark read
              </Button>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">{n.body}</p>
        </li>
      ))}
    </ul>
  );
}
