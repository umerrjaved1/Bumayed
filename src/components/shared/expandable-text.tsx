"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Long text clamped to a few lines with a fade and a "Read more" toggle.
 * The toggle only appears when the text actually overflows.
 */
export function ExpandableText({
  text,
  moreLabel,
  lessLabel,
  lines = 5,
}: {
  text: string;
  moreLabel: string;
  lessLabel: string;
  lines?: number;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setOverflows(el.scrollHeight > el.clientHeight + 2);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  return (
    <div>
      <div className="relative">
        <p
          ref={ref}
          className="leading-relaxed whitespace-pre-line text-muted-foreground"
          style={open ? undefined : { display: "-webkit-box", WebkitLineClamp: lines, WebkitBoxOrient: "vertical", overflow: "hidden" }}
        >
          {text}
        </p>
        {!open && overflows && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background to-transparent" />
        )}
      </div>
      {(overflows || open) && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="mt-2 inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-primary"
        >
          {open ? lessLabel : moreLabel}
          <ChevronDown
            className={cn("size-4 transition-transform duration-300", open && "rotate-180")}
            aria-hidden
          />
        </button>
      )}
    </div>
  );
}
