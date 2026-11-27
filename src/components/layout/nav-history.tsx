"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";

const KEY = "bumayed:in-site-pages";

/**
 * Counts pages seen in this tab. In-site navigations happen without a full
 * page load, so `document.referrer` can't tell whether "Back" would stay on
 * the site; this counter can.
 */
export function NavHistoryTracker() {
  const pathname = usePathname();
  useEffect(() => {
    try {
      const n = Number(window.sessionStorage.getItem(KEY) ?? "0");
      window.sessionStorage.setItem(KEY, String(n + 1));
    } catch {
      /* storage blocked */
    }
  }, [pathname]);
  return null;
}

/** True when the previous history entry is a page on this site. */
export function cameFromThisSite(): boolean {
  try {
    if (Number(window.sessionStorage.getItem(KEY) ?? "0") > 1) return true;
  } catch {
    /* storage blocked: fall through */
  }
  try {
    return (
      !!document.referrer &&
      new URL(document.referrer).origin === window.location.origin
    );
  } catch {
    return false;
  }
}
