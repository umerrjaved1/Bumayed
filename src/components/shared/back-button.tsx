"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { cameFromThisSite } from "@/components/layout/nav-history";

/**
 * Goes back to where the visitor came from on this site (keeping their
 * search and scroll position); if they landed here directly, it takes them
 * to a sensible parent page instead of leaving the site.
 */
export function BackButton({
  fallbackHref,
  label,
  className,
}: {
  fallbackHref: string;
  label: string;
  className?: string;
}) {
  const router = useRouter();

  function onClick() {
    if (cameFromThisSite() && window.history.length > 1) router.back();
    else router.push(fallbackHref);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "glass grid size-10 place-items-center rounded-full text-foreground shadow-lg transition-transform active:scale-90",
        className,
      )}
    >
      <ArrowLeft className="size-5 rtl:rotate-180" aria-hidden />
    </button>
  );
}
