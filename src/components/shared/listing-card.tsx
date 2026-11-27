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
  Hash,
  Heart,
  MapPin,
  Ship,
  Sparkles,
  Zap,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PriceDisplay } from "@/components/shared/price-display";
import { PlateBadge } from "@/components/shared/plate-badge";
import { useFavorites } from "@/components/shared/favorites-provider";
import { cn } from "@/lib/utils";
import type { ListingPublicDto } from "@/modules/listings/types";

const CATEGORY_ICONS = {
  cars: Car,
  motorcycles: CircleGauge,
  boats: Ship,
  plates: Hash,
};

/** The fields a card needs (also what "Recently viewed" keeps on the device). */
export type ListingCardData = Partial<
  Pick<
    ListingPublicDto,
    "price" | "currency" | "country" | "regionEn" | "regionAr"
  >
> &
  Pick<
    ListingPublicDto,
    | "id"
    | "slug"
    | "category"
    | "title"
    | "priceAed"
    | "negotiable"
    | "year"
    | "mileageKm"
    | "emirate"
    | "photos"
    | "photoCount"
    | "featured"
    | "urgent"
    | "plateEmirate"
    | "plateCode"
    | "plateNumber"
    | "plateType"
  >;

/** Heart on the card photo: save without opening the ad. */
function SaveHeart({ listingId, title }: { listingId: string; title: string }) {
  const t = useTranslations("favorites");
  const favorites = useFavorites();
  if (!favorites) return null;
  const on = favorites.isSaved(listingId);
  return (
    <button
      type="button"
      onClick={() => void favorites.toggle(listingId)}
      disabled={favorites.pending(listingId)}
      aria-pressed={on}
      aria-label={`${on ? t("remove") : t("add")}: ${title}`}
      className={cn(
        "absolute end-3 top-3 z-10 grid size-10 place-items-center rounded-full shadow-md backdrop-blur transition-all duration-300 active:scale-90",
        on
          ? "bg-white text-destructive"
          : "bg-black/35 text-white hover:bg-black/55",
      )}
    >
      <Heart
        key={on ? "on" : "off"}
        className={cn(
          "size-[1.15rem]",
          on && "animate-in fill-current duration-300 zoom-in-50",
        )}
        aria-hidden
      />
    </button>
  );
}

export function ListingCard({
  listing,
  priority = false,
}: {
  listing: ListingCardData;
  priority?: boolean;
}) {
  const t = useTranslations("listing");
  const te = useTranslations("emirates");
  const tp = useTranslations("plates");
  const locale = useLocale();
  // Region names come with the ad; entries saved on this device before
  // countries existed fall back to the UAE emirate names.
  const regionLabel = listing.regionEn
    ? locale === "ar"
      ? listing.regionAr
      : listing.regionEn
    : te(listing.emirate as Parameters<typeof te>[0]);
  const plate =
    listing.category === "plates" &&
    listing.plateEmirate &&
    listing.plateCode &&
    listing.plateNumber
      ? {
          emirate: listing.plateEmirate,
          code: listing.plateCode,
          number: listing.plateNumber,
          type: listing.plateType ?? "private",
        }
      : null;
  const Icon = CATEGORY_ICONS[listing.category];

  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-AE" : "en-AE");
  const photoCount = listing.photoCount || listing.photos.length;

  return (
    <div className="group/card relative h-full">
      <Link
        href={`/listings/${listing.slug}`}
        className="block h-full rounded-2xl outline-offset-4"
      >
        <article className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/[0.07] transition-all duration-500 ease-[var(--ease-out-expo)] group-hover/card:-translate-y-1.5 group-hover/card:shadow-[0_24px_48px_-20px_oklch(0.2_0.05_258/0.35)] group-hover/card:ring-accent/40 group-active/card:scale-[0.985]">
          {/* Photo */}
          <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary/85 to-ink sm:aspect-[4/3]">
            {plate ? (
              <div className="grid h-full place-items-center">
                <PlateBadge
                  {...plate}
                  label={tp("label", {
                    emirate: te(plate.emirate),
                    code: plate.code,
                    number: plate.number,
                  })}
                  className="transition-transform duration-500 group-hover/card:scale-105"
                />
              </div>
            ) : listing.photos[0] ? (
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
                  <span className="absolute inset-0 shimmer-bg" aria-hidden />
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
            {photoCount > 0 && !plate && (
              <span
                className="absolute start-3 bottom-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-medium text-white glass-dark"
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
                // Older "Recently viewed" entries saved before countries existed are in dirhams.
                amount={listing.price ?? listing.priceAed}
                currency={listing.currency ?? "AED"}
                className="font-heading text-xl font-bold"
              />
              {listing.negotiable && (
                <span className="rounded-md bg-success/10 px-1.5 py-0.5 text-xs font-semibold text-success">
                  {t("negotiable")}
                </span>
              )}
            </div>

            <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4 text-xs text-muted-foreground">
              {plate ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                  <Hash className="size-3" aria-hidden />
                  {tp(`type.${plate.type}`)}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 tabular-nums">
                  <Calendar className="size-3" aria-hidden />
                  {listing.year}
                </span>
              )}
              {listing.mileageKm != null && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 tabular-nums">
                  <Gauge className="size-3" aria-hidden />
                  {nf.format(listing.mileageKm)} {t("km")}
                </span>
              )}
              <span className="ms-auto inline-flex items-center gap-1">
                <MapPin className="size-3.5 text-accent" aria-hidden />
                {regionLabel}
              </span>
            </div>
          </div>
        </article>
      </Link>
      <SaveHeart listingId={listing.id} title={listing.title} />
    </div>
  );
}
