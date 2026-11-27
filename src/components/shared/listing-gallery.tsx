"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Swipeable photo gallery: scroll-snap on touch, arrows on desktop, tappable
 * thumbnails, and a full-screen viewer. RTL-safe because it moves with
 * scrollIntoView and tracks the visible slide with IntersectionObserver.
 */
export function ListingGallery({
  photos,
  title,
  badges,
}: {
  photos: string[];
  title: string;
  badges?: React.ReactNode;
}) {
  const t = useTranslations("detail");
  const track = useRef<HTMLDivElement>(null);
  const slides = useRef<(HTMLDivElement | null)[]>([]);
  const [index, setIndex] = useState(0);
  const [viewer, setViewer] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);
  const count = photos.length;

  useEffect(() => {
    const root = track.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > 0.6) {
            setIndex(Number((e.target as HTMLElement).dataset.index));
          }
        }
      },
      { root, threshold: [0.6] },
    );
    slides.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [count]);

  function go(i: number) {
    const next = (i + count) % count;
    slides.current[next]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
    setIndex(next);
  }

  // Keyboard and scroll lock for the full-screen viewer.
  useEffect(() => {
    if (viewer === null) return;
    function onKey(e: KeyboardEvent) {
      const rtl = document.dir === "rtl";
      if (e.key === "Escape") setViewer(null);
      if (e.key === "ArrowRight")
        setViewer((v) => ((v ?? 0) + (rtl ? -1 : 1) + count) % count);
      if (e.key === "ArrowLeft")
        setViewer((v) => ((v ?? 0) + (rtl ? 1 : -1) + count) % count);
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [viewer, count]);

  if (count === 0) return null;

  return (
    <div>
      <div className="group relative -mx-4 overflow-hidden bg-muted sm:mx-0 sm:rounded-2xl">
        <div
          ref={track}
          className="flex aspect-[4/3] snap-x sm:aspect-[16/10] snap-mandatory [scrollbar-width:none] overflow-x-auto overscroll-x-contain [&::-webkit-scrollbar]:hidden"
        >
          {photos.map((src, i) => (
            <div
              key={src}
              ref={(el) => {
                slides.current[i] = el;
              }}
              data-index={i}
              className="relative h-full w-full shrink-0 snap-start"
            >
              <button
                type="button"
                className="absolute inset-0 cursor-zoom-in"
                onClick={() => setViewer(i)}
                aria-label={t("openPhoto", { n: i + 1, total: count })}
              >
                <Image
                  src={src}
                  alt={`${title} ${i + 1}`}
                  fill
                  sizes="(min-width: 1024px) 66vw, 100vw"
                  className="object-cover"
                  priority={i === 0}
                />
              </button>
            </div>
          ))}
        </div>

        {badges && (
          <div className="pointer-events-none absolute start-3 bottom-8 flex gap-1.5 sm:top-3 sm:bottom-auto">
            {badges}
          </div>
        )}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label={t("prevPhoto")}
              className="absolute start-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-md transition-opacity hover:bg-background sm:flex sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronLeft className="size-5 rtl:rotate-180" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label={t("nextPhoto")}
              className="absolute end-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-md transition-opacity hover:bg-background sm:flex sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronRight className="size-5 rtl:rotate-180" aria-hidden />
            </button>
          </>
        )}

        {/* Bottom fade so the dots and counter stay readable on bright photos */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent sm:hidden" />

        {count > 1 && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-9 flex justify-center gap-1.5 sm:hidden"
            aria-hidden
          >
            {photos.slice(0, 10).map((src, i) => (
              <span
                key={src}
                className={`h-1.5 rounded-full shadow-sm transition-all duration-500 ease-[var(--ease-spring)] ${
                  i === Math.min(index, 9) ? "w-5 bg-white" : "w-1.5 bg-white/55"
                }`}
              />
            ))}
          </div>
        )}

        <div className="pointer-events-none absolute end-3 bottom-8 flex items-center gap-1.5 rounded-full bg-black/55 sm:bottom-3 px-2.5 py-1 text-xs font-medium text-white tabular-nums backdrop-blur-sm">
          <Expand className="size-3.5" aria-hidden />
          <span dir="ltr">
            {index + 1} / {count}
          </span>
        </div>
      </div>

      {count > 1 && (
        <div className="mt-2 hidden [scrollbar-width:none] gap-2 overflow-x-auto pb-1 sm:flex">
          {photos.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => go(i)}
              aria-label={t("openPhoto", { n: i + 1, total: count })}
              aria-current={i === index}
              className={`relative aspect-video w-20 shrink-0 overflow-hidden rounded-md border-2 transition sm:w-24 ${
                i === index
                  ? "border-accent"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {viewer !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-[90] flex animate-in items-center justify-center bg-black fade-in duration-300"
          onClick={() => setViewer(null)}
          onTouchStart={(e) => {
            touchX.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            const start = touchX.current;
            touchX.current = null;
            const end = e.changedTouches[0]?.clientX;
            if (start == null || end == null || count < 2) return;
            const dx = end - start;
            if (Math.abs(dx) < 50) return;
            // Swiping toward the reading direction's start shows the next photo.
            const rtl = document.dir === "rtl";
            const forward = rtl ? dx > 0 : dx < 0;
            setViewer((v) => ((v ?? 0) + (forward ? 1 : -1) + count) % count);
          }}
        >
          <div
            className="relative h-full w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              key={viewer}
              src={photos[viewer]}
              alt={`${title} ${viewer + 1}`}
              fill
              sizes="100vw"
              className="animate-in object-contain fade-in zoom-in-95 duration-300"
            />
          </div>
          <button
            type="button"
            onClick={() => setViewer(null)}
            aria-label={t("closePhoto")}
            className="absolute end-4 top-4 flex size-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
          >
            <X className="size-6" aria-hidden />
          </button>
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewer((v) => ((v ?? 0) - 1 + count) % count);
                }}
                aria-label={t("prevPhoto")}
                className="absolute start-3 top-1/2 flex size-11 -translate-y-1/2 sm:size-12 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
              >
                <ChevronLeft className="size-6 rtl:rotate-180" aria-hidden />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewer((v) => ((v ?? 0) + 1) % count);
                }}
                aria-label={t("nextPhoto")}
                className="absolute end-3 top-1/2 flex size-11 -translate-y-1/2 sm:size-12 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
              >
                <ChevronRight className="size-6 rtl:rotate-180" aria-hidden />
              </button>
              <p
                dir="ltr"
                className="absolute start-1/2 bottom-6 -translate-x-1/2 rounded-full bg-white/15 px-3 py-1 text-sm text-white tabular-nums rtl:translate-x-1/2"
              >
                {viewer + 1} / {count}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
