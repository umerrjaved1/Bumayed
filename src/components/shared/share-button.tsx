"use client";

import { useTranslations } from "next-intl";
import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ShareButton({ title }: { title: string }) {
  const t = useTranslations("detail");

  async function onShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* user cancelled — fall through to clipboard */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("shareCopied"));
    } catch {
      // Clipboard blocked (permissions or an insecure context): show the link instead.
      toast(t("shareManual"), { description: url });
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={onShare}>
      <Share2 className="size-4" aria-hidden />
      {t("share")}
    </Button>
  );
}
