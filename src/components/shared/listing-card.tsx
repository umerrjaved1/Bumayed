"use client";

import { useLocale, useTranslations } from "next-intl";
import { Car, CircleGauge, MapPin, Ship } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PriceDisplay } from "@/components/shared/price-display";
import type { ListingPublicDto } from "@/modules/listings/types";

const CATEGORY_ICONS = { cars: Car, motorcycles: CircleGauge, boats: Ship };

export function ListingCard({ listing }: { listing: ListingPublicDto }) {
  const t = useTranslations("listing");
  const te = useTranslations("emirates");
  const locale = useLocale();
  const Icon = CATEGORY_ICONS[listing.category];

  const mileage = new Intl.NumberFormat(
    locale === "ar" ? "ar-AE" : "en-AE",
  ).format(listing.mileageKm ?? 0);

  return (
    <Link href={`/listings/${listing.slug}`} className="group block">
      <Card className="h-full gap-0 overflow-hidden py-0 transition-shadow group-hover:shadow-md">
        {/* Photo area — placeholder until image pipeline (Phase 5) */}
        <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-gradient-to-br from-primary/85 to-primary">
          {listing.photos[0] ? (
            <img
              src={listing.photos[0]}
              alt={listing.title}
              className="size-full object-cover"
              loading="lazy"
            />
          ) : (
            <>
              <Icon className="size-12 text-primary-foreground/40" aria-hidden />
              <span className="sr-only">{t("photoPlaceholder")}</span>
            </>
          )}
          <div className="absolute start-2 top-2 flex gap-1">
            {listing.featured && (
              <Badge className="bg-accent text-accent-foreground">
                {t("featured")}
              </Badge>
            )}
            {listing.urgent && (
              <Badge variant="destructive">{t("urgent")}</Badge>
            )}
          </div>
        </div>
        <CardContent className="p-4">
          <PriceDisplay amountAed={listing.priceAed} className="text-lg" />
          <h3 className="mt-1 line-clamp-1 font-medium">{listing.title}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="tabular-nums">{listing.year}</span>
            {listing.mileageKm != null && (
              <span className="tabular-nums">
                {mileage} {t("km")}
              </span>
            )}
            {listing.negotiable && <span>{t("negotiable")}</span>}
            <span className="ms-auto inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden />
              {te(listing.emirate)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
