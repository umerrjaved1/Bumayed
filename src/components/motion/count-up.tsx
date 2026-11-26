"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";

/**
 * Counts from 0 to `value` once it scrolls into view (eased, ~1.4s).
 * Server markup shows the final number, so it reads correctly without JS
 * or with reduced motion; the animation writes to the DOM directly.
 */
export function CountUp({
  value,
  suffix = "",
  duration = 1400,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const locale = useLocale();
  const ref = useRef<HTMLSpanElement>(null);
  const fmt = new Intl.NumberFormat(locale === "ar" ? "ar-AE" : "en-AE");
  const final = `${fmt.format(value)}${suffix}`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const nf = new Intl.NumberFormat(locale === "ar" ? "ar-AE" : "en-AE");
    el.textContent = `${nf.format(0)}${suffix}`;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 4);
          el.textContent = `${nf.format(Math.round(value * eased))}${suffix}`;
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = `${nf.format(value)}${suffix}`;
    };
  }, [value, suffix, duration, locale]);

  return (
    <span ref={ref} className="tabular-nums" suppressHydrationWarning>
      {final}
    </span>
  );
}
