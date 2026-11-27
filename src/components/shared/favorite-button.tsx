"use client";

import { useEffect } from "react";
import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/components/shared/favorites-provider";

/** Save / Saved button on the ad page; shares state with the card hearts. */
export function FavoriteButton({
  listingId,
  initial = false,
  className,
}: {
  listingId: string;
  initial?: boolean;
  className?: string;
}) {
  const t = useTranslations("favorites");
  const favorites = useFavorites();

  useEffect(() => {
    favorites?.seed(listingId, initial);
    // Seed once with what the server rendered.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId, initial]);

  const on = favorites ? favorites.isSaved(listingId) : initial;
  const pending = favorites?.pending(listingId) ?? false;

  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      disabled={pending}
      onClick={() => void favorites?.toggle(listingId)}
      aria-pressed={on}
      aria-label={on ? t("remove") : t("add")}
    >
      <Heart
        key={on ? "on" : "off"}
        className={
          on
            ? "size-4 animate-in fill-current text-destructive zoom-in-50 duration-300"
            : "size-4"
        }
      />
      {on ? t("saved") : t("save")}
    </Button>
  );
}
