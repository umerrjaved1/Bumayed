"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function FavoriteButton({
  listingId,
  initial = false,
}: {
  listingId: string;
  initial?: boolean;
}) {
  const t = useTranslations("favorites");
  const router = useRouter();
  const [on, setOn] = useState(initial);
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    try {
      if (on) {
        const res = await fetch(
          `/api/favorites?listingId=${encodeURIComponent(listingId)}`,
          { method: "DELETE" },
        );
        if (res.status === 401) {
          router.push("/auth/login");
          return;
        }
        if (res.ok) setOn(false);
      } else {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId }),
        });
        if (res.status === 401) {
          router.push("/auth/login");
          return;
        }
        if (res.ok) setOn(true);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? t("remove") : t("add")}
    >
      <Heart className={on ? "size-4 fill-current text-destructive" : "size-4"} />
      {on ? t("saved") : t("save")}
    </Button>
  );
}
