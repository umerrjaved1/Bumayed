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
      <div className="group relative overflow-hidden rounded-xl bg-muted">
        <div
          ref={track}
          className="flex aspect-[16/10] snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto overscroll-x-contain [&::-webkit-scrollbar]:hidden"
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
          <div className="pointer-events-none absolute start-3 top-3 flex gap-1.5">
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

        <div className="pointer-events-none absolute end-3 bottom-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white tabular-nums">
          <Expand className="size-3.5" aria-hidden />
          <span dir="ltr">
            {index + 1} / {count}
          </span>
        </div>
      </div>

      {count > 1 && (
        <div className="mt-2 flex [scrollbar-width:none] gap-2 overflow-x-auto pb-1">
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
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black"
          onClick={() => setViewer(null)}
        >
          <div
            className="relative h-full w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[viewer]}
              alt={`${title} ${viewer + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
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
                className="absolute start-3 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
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
                className="absolute end-3 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
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
