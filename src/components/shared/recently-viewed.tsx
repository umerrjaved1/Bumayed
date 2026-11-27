"use client";

import { useEffect, useState } from "react";
import { History, X } from "lucide-react";
import {
  ListingCard,
  type ListingCardData,
} from "@/components/shared/listing-card";
import { Rail } from "@/components/motion/rail";
import { railItem } from "@/components/motion/rail-item";

/**
 * "Recently viewed" lives only in this browser (localStorage): nothing is
 * sent to the server. Storage can be unavailable (private mode, blocked
 * site data), so every access is guarded and the UI simply hides.
 */
const KEY = "bumayed:recently-viewed";
const MAX = 12;

function read(): ListingCardData[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as ListingCardData[]) : [];
  } catch {
    return [];
  }
}

function write(items: ListingCardData[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* storage full or blocked: skip */
  }
}

/** Drop on the ad page: remembers this ad for the homepage row. */
export function RecentlyViewedTracker({ listing }: { listing: ListingCardData }) {
  useEffect(() => {
    const entry: ListingCardData = {
      ...listing,
      // Keep the stored copy small: the first photo is all a card shows.
      photos: listing.photos.slice(0, 1),
    };
    const rest = read().filter((l) => l.slug !== listing.slug);
    write([entry, ...rest].slice(0, MAX));
  }, [listing]);
  return null;
}

/** Homepage row: "Recently viewed", hidden until the visitor has opened an ad. */
export function RecentlyViewedRail({
  title,
  subtitle,
  clearLabel,
}: {
  title: string;
  subtitle: string;
  clearLabel: string;
}) {
  const [items, setItems] = useState<ListingCardData[]>([]);

  useEffect(() => {
    // Read after mount (storage is browser-only), off the critical path.
    const id = window.setTimeout(() => setItems(read().slice(0, 6)), 0);
    return () => window.clearTimeout(id);
  }, []);

  if (items.length === 0) return null;

  function clear() {
    write([]);
    setItems([]);
  }

  return (
    <section className="mx-auto max-w-7xl animate-fade-up px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-heading text-[1.7rem] leading-tight font-bold tracking-tight sm:text-4xl">
            <History className="size-6 text-accent sm:size-7" aria-hidden />
            {title}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground sm:mt-2 sm:text-base">
            {subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={clear}
          className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground active:scale-95"
        >
          <X className="size-4" aria-hidden />
          {clearLabel}
        </button>
      </div>
      <div className="mt-7">
        <Rail className="sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {items.map((l) => (
            <div key={l.slug} className={`${railItem} h-auto sm:h-full`}>
              <ListingCard listing={l} />
            </div>
          ))}
        </Rail>
      </div>
    </section>
  );
}
