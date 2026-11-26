"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowUpRight,
  Calendar,
  Camera,
  Car,
  CircleGauge,
  Gauge,
  MapPin,
  Ship,
  Sparkles,
  Zap,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PriceDisplay } from "@/components/shared/price-display";
import type { ListingPublicDto } from "@/modules/listings/types";

const CATEGORY_ICONS = { cars: Car, motorcycles: CircleGauge, boats: Ship };

export function ListingCard({
  listing,
  priority = false,
}: {
  listing: ListingPublicDto;
  priority?: boolean;
}) {
  const t = useTranslations("listing");
  const te = useTranslations("emirates");
  const locale = useLocale();
  const Icon = CATEGORY_ICONS[listing.category];

  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-AE" : "en-AE");
  const photoCount = listing.photoCount || listing.photos.length;

  return (
    <Link
      href={`/listings/${listing.slug}`}
      className="group/card block h-full rounded-2xl outline-offset-4"
    >
      <article className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/[0.07] transition-all duration-500 ease-[var(--ease-out-expo)] group-hover/card:-translate-y-1.5 group-hover/card:shadow-[0_24px_48px_-20px_oklch(0.2_0.05_258/0.35)] group-hover/card:ring-accent/40 group-active/card:scale-[0.985]">
        {/* Photo */}
        <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[4/3] bg-gradient-to-br from-primary/85 to-ink">
          {listing.photos[0] ? (
            <Image
              src={listing.photos[0]}
              alt={listing.title}
              fill
              priority={priority}
              sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
              className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover/card:scale-[1.07]"
            />
          ) : (
            <div className="grid h-full place-items-center">
              <Icon
                className="size-14 text-primary-foreground/30 transition-transform duration-500 group-hover/card:scale-110"
                aria-hidden
              />
              <span className="sr-only">{t("photoPlaceholder")}</span>
            </div>
          )}

          {/* Legibility gradient */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/10" />

          {/* Badges */}
          <div className="absolute start-3 top-3 flex flex-wrap gap-1.5">
            {listing.featured && (
              <span className="relative inline-flex items-center gap-1 overflow-hidden rounded-full bg-accent px-2.5 py-1 text-[0.7rem] font-semibold text-accent-foreground shadow-md">
                <Sparkles className="size-3" aria-hidden />
                {t("featured")}
                <span className="shimmer-bg absolute inset-0" aria-hidden />
              </span>
            )}
            {listing.urgent && (
              <span className="inline-flex items-center gap-1 rounded-full bg-destructive px-2.5 py-1 text-[0.7rem] font-semibold text-white shadow-md">
                <Zap className="size-3" aria-hidden />
                {t("urgent")}
              </span>
            )}
          </div>

          {/* Photo count + hover arrow */}
          {photoCount > 0 && (
            <span
              className="glass-dark absolute start-3 bottom-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-medium text-white"
              aria-label={t("photos", { count: photoCount })}
            >
              <Camera className="size-3" aria-hidden />
              {nf.format(photoCount)}
            </span>
          )}
          <span
            aria-hidden
            className="absolute end-3 bottom-3 grid size-9 translate-y-3 place-items-center rounded-full bg-white text-ink opacity-0 shadow-lg transition-all duration-500 ease-[var(--ease-spring)] group-hover/card:translate-y-0 group-hover/card:opacity-100"
          >
            <ArrowUpRight className="size-4 rtl:-scale-x-100" />
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-1 font-heading text-[0.95rem] font-semibold tracking-tight transition-colors group-hover/card:text-primary">
            {listing.title}
          </h3>
          <div className="mt-1 flex items-baseline gap-2">
            <PriceDisplay
              amountAed={listing.priceAed}
              className="font-heading text-xl font-bold"
            />
            {listing.negotiable && (
              <span className="rounded-md bg-success/10 px-1.5 py-0.5 text-[0.65rem] font-semibold text-success">
                {t("negotiable")}
              </span>
            )}
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 tabular-nums">
              <Calendar className="size-3" aria-hidden />
              {listing.year}
            </span>
            {listing.mileageKm != null && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 tabular-nums">
                <Gauge className="size-3" aria-hidden />
                {nf.format(listing.mileageKm)} {t("km")}
              </span>
            )}
            <span className="ms-auto inline-flex items-center gap-1">
              <MapPin className="size-3.5 text-accent" aria-hidden />
              {te(listing.emirate)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
