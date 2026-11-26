import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import {
  BadgeCheck,
  Calendar,
  Car,
  CircleGauge,
  ExternalLink,
  MapPin,
  Phone,
  Ship,
} from "lucide-react";
import {
  getPublicListingBySlug,
  getSimilarListings,
} from "@/modules/listings/service";
import { parseVideoUrl } from "@/lib/video";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PriceDisplay } from "@/components/shared/price-display";
import { SpecList } from "@/components/shared/spec-list";
import { ShareButton } from "@/components/shared/share-button";
import { ReportDialog } from "@/components/shared/report-dialog";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { ListingCard } from "@/components/shared/listing-card";
import { publicMetadata } from "@/lib/seo";

const CATEGORY_ICONS = { cars: Car, motorcycles: CircleGauge, boats: Ship };

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const listing = await getPublicListingBySlug(id);
  if (!listing) return {};
  const description = listing.description.slice(0, 160);
  return publicMetadata({
    locale,
    path: `/listings/${listing.slug}`,
    title: listing.title,
    description,
    image: listing.photos[0] ?? null,
  });
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const listing = await getPublicListingBySlug(id);
  if (!listing) notFound();

  const t = await getTranslations("detail");
  const tf = await getTranslations("filters");
  const te = await getTranslations("emirates");
  const tl = await getTranslations("listing");
  const activeLocale = await getLocale();

  const Icon = CATEGORY_ICONS[listing.category];
  const video = listing.videoUrl ? parseVideoUrl(listing.videoUrl) : null;
  const nf = new Intl.NumberFormat(activeLocale === "ar" ? "ar-AE" : "en-AE");

  // Spec rows — only fields that exist for this listing/category
  const specs: { label: string; value: string }[] = [
    { label: t("make"), value: listing.make },
    { label: t("model"), value: listing.model },
    ...(listing.trim ? [{ label: t("trim"), value: listing.trim }] : []),
    { label: t("year"), value: String(listing.year) },
    ...(listing.mileageKm != null
      ? [{ label: t("mileage"), value: `${nf.format(listing.mileageKm)} ${t("km")}` }]
      : []),
    ...(listing.transmission
      ? [{ label: tf("transmission"), value: tf(listing.transmission) }]
      : []),
    ...(listing.fuelType
      ? [{ label: tf("fuelType"), value: tf(listing.fuelType) }]
      : []),
    ...(listing.regionalSpec
      ? [{ label: tf("regionalSpec"), value: tf(listing.regionalSpec) }]
      : []),
    ...(listing.bodyType ? [{ label: t("bodyType"), value: listing.bodyType }] : []),
    ...(listing.colour ? [{ label: t("colour"), value: listing.colour }] : []),
    ...(listing.engineCc
      ? [{ label: t("engineCc"), value: `${nf.format(listing.engineCc)} ${t("cc")}` }]
      : []),
    ...(listing.motoType
      ? [{ label: tf("motoType"), value: tf(listing.motoType) }]
      : []),
    ...(listing.boatType
      ? [{ label: tf("boatType"), value: tf(listing.boatType) }]
      : []),
    ...(listing.lengthFt
      ? [{ label: t("lengthFt"), value: `${nf.format(listing.lengthFt)} ${t("ft")}` }]
      : []),
    ...(listing.engineHours
      ? [
          {
            label: t("engineHours"),
            value: `${nf.format(listing.engineHours)} ${t("hours")}`,
          },
        ]
      : []),
    ...(listing.engineType
      ? [{ label: t("engineType"), value: listing.engineType }]
      : []),
    { label: tf("condition"), value: tf(listing.condition) },
    ...(listing.warranty !== undefined
      ? [
          {
            label: t("warranty"),
            value: listing.warranty ? t("warrantyYes") : t("warrantyNo"),
          },
        ]
      : []),
  ];

  const similar = await getSimilarListings(listing.category, listing.slug, 3);

  const postedDate = new Intl.DateTimeFormat(
    activeLocale === "ar" ? "ar-AE" : "en-AE",
    { dateStyle: "medium" },
  ).format(new Date(listing.createdAt));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": listing.category === "boats" ? "Product" : "Vehicle",
            name: listing.title,
            description: listing.description.slice(0, 300),
            image: listing.photos,
            brand: listing.make,
            model: listing.model,
            vehicleModelDate: listing.year,
            offers: {
              "@type": "Offer",
              priceCurrency: "AED",
              price: listing.priceAed,
              availability: "https://schema.org/InStock",
            },
          }),
        }}
      />
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Main column */}
        <div>
          {/* Gallery — placeholders until image pipeline (Phase 5) */}
          <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary/85 to-primary">
            {listing.photos[0] ? (
              // Local uploads are served as static files; first image is the LCP candidate.
              <img
                src={listing.photos[0]}
                alt={listing.title}
                className="size-full object-cover"
                fetchPriority="high"
              />
            ) : (
              <Icon className="size-20 text-primary-foreground/40" aria-hidden />
            )}
            <div className="absolute start-3 top-3 flex gap-1.5">
              {listing.featured && (
                <Badge className="bg-accent text-accent-foreground">
                  {tl("featured")}
                </Badge>
              )}
              {listing.urgent && <Badge variant="destructive">{tl("urgent")}</Badge>}
            </div>
          </div>
          <div className="mt-2 grid grid-cols-6 gap-2">
            {listing.photos.slice(0, 6).map((src, i) => (
              <div
                key={src}
                className={`overflow-hidden rounded border bg-muted ${i === 0 ? "ring-2 ring-accent" : ""}`}
              >
                <img
                  src={src}
                  alt={`${listing.title} ${i + 1}`}
                  className="aspect-video size-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          {/* Title / price / actions */}
          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <PriceDisplay amountAed={listing.priceAed} className="text-3xl" />
              {listing.negotiable && (
                <Badge variant="secondary" className="ms-2">
                  {tl("negotiable")}
                </Badge>
              )}
              <h1 className="mt-2 text-2xl font-bold tracking-tight">
                {listing.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-4" aria-hidden />
                  {listing.city.toLowerCase() === te(listing.emirate).toLowerCase()
                    ? te(listing.emirate)
                    : `${listing.city}, ${te(listing.emirate)}`}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-4" aria-hidden />
                  {t("postedOn", { date: postedDate })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FavoriteButton listingId={listing.id} />
              <ShareButton title={listing.title} />
              <ReportDialog listingId={listing.id} />
            </div>
          </div>

          {/* Specifications */}
          <section className="mt-8">
            <h2 className="text-lg font-semibold">{t("specs")}</h2>
            <div className="mt-4">
              <SpecList specs={specs} />
            </div>
          </section>

          {/* Description */}
          <section className="mt-8">
            <h2 className="text-lg font-semibold">{t("description")}</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {listing.description}
            </p>
          </section>

          {/* Social video */}
          {video && (
            <section className="mt-8">
              <h2 className="text-lg font-semibold">{t("video")}</h2>
              {video.embedUrl ? (
                <div className="mt-4 aspect-video overflow-hidden rounded-lg border">
                  <iframe
                    src={video.embedUrl}
                    title={t("video")}
                    className="size-full"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <Button variant="outline" className="mt-4" render={<a href={video.watchUrl} target="_blank" rel="noopener noreferrer" />}>
                  <ExternalLink className="size-4" aria-hidden />
                  {t("watchOn", { provider: video.provider })}
                </Button>
              )}
            </section>
          )}
        </div>

        {/* Seller panel */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {listing.seller.name.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="flex items-center gap-1.5 font-semibold">
                    {listing.seller.dealerName ?? listing.seller.name}
                    {listing.seller.verified && (
                      <BadgeCheck className="size-4 text-success" aria-label={t("verified")} />
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t(listing.seller.type)} ·{" "}
                    {t("memberSince", { year: listing.seller.since })}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-2">
                <Button size="lg" render={<a href={`tel:+${listing.seller.phone}`} />}>
                  <Phone className="size-4" aria-hidden />
                  {t("call")}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-success text-success hover:bg-success/10"
                  render={
                    <a
                      href={`https://wa.me/${listing.seller.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  {t("whatsapp")}
                </Button>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                {t("safetyNote")}
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Similar listings */}
      {similar.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight">{t("similar")}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((l) => (
              <ListingCard key={l.slug} listing={l} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
