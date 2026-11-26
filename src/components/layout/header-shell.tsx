"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Sticky header frame that turns from airy to compact glass once the page
 * scrolls, and shows a thin gold progress line for reading position.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 8);
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(1, y / max) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header
      data-scrolled={scrolled || undefined}
      className={cn(
        "group/header sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-500",
        scrolled
          ? "glass border-border/60 shadow-[0_8px_30px_-12px_oklch(0.2_0.04_258/0.18)]"
          : "border-transparent bg-background",
      )}
    >
      {children}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-[-1px] h-[2px] origin-left bg-gradient-to-r from-accent via-gold-soft to-accent transition-opacity duration-300 rtl:origin-right"
        style={{ transform: `scaleX(${progress})`, opacity: scrolled ? 1 : 0 }}
      />
    </header>
  );
}
