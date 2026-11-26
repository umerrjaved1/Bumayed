"use client";

import { Children, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Phones: a horizontal, snap-scrolling row with position dots.
 * From `sm` up: a normal grid (pass the grid columns via `className`).
 */
export function Rail({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const count = Children.count(children);

  function onScroll() {
    const el = ref.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    const step = first.offsetWidth + 16; // gap-4
    // scrollLeft is negative in RTL, so compare magnitudes.
    setActive(Math.min(count - 1, Math.round(Math.abs(el.scrollLeft) / step)));
  }

  function goTo(i: number) {
    const el = ref.current;
    const target = el?.children[i] as HTMLElement | undefined;
    target?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  }

  return (
    <div>
      <div
        ref={ref}
        onScroll={onScroll}
        className={cn(
          "scrollbar-none -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto overscroll-x-contain px-4 pb-1 sm:mx-0 sm:grid sm:overflow-visible sm:px-0 sm:pb-0",
          className,
        )}
      >
        {children}
      </div>
      {count > 1 && (
        <div className="mt-4 flex justify-center gap-1.5 sm:hidden" aria-hidden>
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              type="button"
              tabIndex={-1}
              onClick={() => goTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500 ease-[var(--ease-spring)]",
                i === active ? "w-6 bg-accent" : "w-1.5 bg-foreground/15",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
