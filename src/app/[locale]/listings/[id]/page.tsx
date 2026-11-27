import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import {
  BadgeCheck,
  Calendar,
  ChevronRight,
  Car,
  CircleGauge,
  Cog,
  ExternalLink,
  Fuel,
  Gauge,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Ship,
  Sparkles,
} from "lucide-react";
import { cache } from "react";
import type { Role } from "@/generated/prisma/client";
import { getSession } from "@/lib/session";
import { isFavorited } from "@/modules/listings/repository";
import {
  getSimilarListings,
  getVisibleListingBySlug,
} from "@/modules/listings/service";
import { privateRobots, siteUrl } from "@/lib/seo";
import { parseVideoUrl } from "@/lib/video";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PriceDisplay } from "@/components/shared/price-display";
import { SpecList } from "@/components/shared/spec-list";
import { ShareButton } from "@/components/shared/share-button";
import { ReportDialog } from "@/components/shared/report-dialog";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { ListingCard } from "@/components/shared/listing-card";
import { ListingGallery } from "@/components/shared/listing-gallery";
import { ExpandableText } from "@/components/shared/expandable-text";
import { BackButton } from "@/components/shared/back-button";
import { RecentlyViewedTracker } from "@/components/shared/recently-viewed";
import { Link } from "@/i18n/navigation";
import { Rail } from "@/components/motion/rail";
import { railItem } from "@/components/motion/rail-item";
import { publicMetadata } from "@/lib/seo";

const CATEGORY_ICONS = { cars: Car, motorcycles: CircleGauge, boats: Ship };

/** Metadata and the page both need the ad: load it once per request. */
const loadListing = cache(
  async (slug: string, viewerId: string | null, viewerRole: Role | null) =>
    getVisibleListingBySlug(
      slug,
      viewerId && viewerRole ? { id: viewerId, role: viewerRole } : null,
    ),
);

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const session = await getSession();
  const visible = await loadListing(
    id,
    session?.user?.id ?? null,
    session?.user?.role ?? null,
  );
  if (!visible) return {};
  const listing = visible.listing;
  const description = listing.description.slice(0, 160);
  const meta = publicMetadata({
    locale,
    path: `/listings/${listing.slug}`,
    title: listing.title,
    description,
    image: listing.photos[0] ?? null,
  });
  return visible.preview ? { ...meta, ...privateRobots } : meta;
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const visible = await loadListing(
    id,
    session?.user?.id ?? null,
    session?.user?.role ?? null,
  );
  if (!visible) notFound();
  const listing = visible.listing;
  const viewerId = session?.user?.id;
  // Independent lookups: run them together instead of one after another.
  const [favorited, similar] = await Promise.all([
    viewerId ? isFavorited(viewerId, listing.id) : Promise.resolve(false),
    getSimilarListings(listing.category, listing.slug, 3),
  ]);

  const t = await getTranslations("detail");
  const tn = await getTranslations("nav");
  const tf = await getTranslations("filters");
  const te = await getTranslations("emirates");
  const tl = await getTranslations("listing");
  const activeLocale = await getLocale();
  const previewMessage =
    visible.status === "PENDING"
      ? t("previewPending")
      : visible.status === "DRAFT"
        ? t("previewDraft")
        : visible.status === "REJECTED"
          ? t("previewRejected")
          : visible.preview
            ? t("previewHidden")
            : null;

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
      ? [
          {
            label: t("mileage"),
            value: `${nf.format(listing.mileageKm)} ${t("km")}`,
          },
        ]
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
    ...(listing.bodyType
      ? [{ label: t("bodyType"), value: listing.bodyType }]
      : []),
    ...(listing.colour ? [{ label: t("colour"), value: listing.colour }] : []),
    ...(listing.engineCc
      ? [
          {
            label: t("engineCc"),
            value: `${nf.format(listing.engineCc)} ${t("cc")}`,
          },
        ]
      : []),
    ...(listing.motoType
      ? [{ label: tf("motoType"), value: tf(listing.motoType) }]
      : []),
    ...(listing.boatType
      ? [{ label: tf("boatType"), value: tf(listing.boatType) }]
      : []),
    ...(listing.lengthFt
      ? [
          {
            label: t("lengthFt"),
            value: `${nf.format(listing.lengthFt)} ${t("ft")}`,
          },
        ]
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


  const postedDate = new Intl.DateTimeFormat(
    activeLocale === "ar" ? "ar-AE" : "en-AE",
    { dateStyle: "medium" },
  ).format(new Date(listing.createdAt));

  const cityName = activeLocale === "ar" ? listing.cityAr : listing.city;
  const telHref = `tel:+${listing.seller.phone}`;
  const whatsappHref = `https://wa.me/${listing.seller.whatsapp}?text=${encodeURIComponent(
    t("whatsappMessage", {
      title: listing.title,
      url: `${siteUrl()}/${activeLocale}/listings/${listing.slug}`,
    }),
  )}`;
  const sellerName = listing.seller.dealerName ?? listing.seller.name;
  const locationLabel =
    cityName === te(listing.emirate) ||
    listing.city.toLowerCase() === listing.emirate.toLowerCase() ||
    listing.city.toLowerCase() === te(listing.emirate).toLowerCase()
      ? te(listing.emirate)
      : `${cityName}${activeLocale === "ar" ? "، " : ", "}${te(listing.emirate)}`;

  // Quick-glance facts shown as chips under the title.
  const highlights = [
    { icon: Calendar, label: String(listing.year) },
    ...(listing.mileageKm != null
      ? [{ icon: Gauge, label: `${nf.format(listing.mileageKm)} ${t("km")}` }]
      : []),
    ...(listing.transmission
      ? [{ icon: Cog, label: tf(listing.transmission) }]
      : []),
    ...(listing.fuelType ? [{ icon: Fuel, label: tf(listing.fuelType) }] : []),
    { icon: Sparkles, label: tf(listing.condition) },
  ];

  const badges =
    listing.featured || listing.urgent ? (
      <>
        {listing.featured && (
          <Badge className="bg-accent text-accent-foreground shadow-md">
            {tl("featured")}
          </Badge>
        )}
        {listing.urgent && (
          <Badge variant="destructive" className="shadow-md">
            {tl("urgent")}
          </Badge>
        )}
      </>
    ) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-0 pb-32 sm:px-6 sm:pt-8 lg:px-8 lg:pb-12">
      {previewMessage && (
        <p className="mt-4 mb-4 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm sm:mt-0 sm:mb-6">
          {previewMessage}
        </p>
      )}
      {!visible.preview && (
        <RecentlyViewedTracker
          listing={{
            // Only what a card shows; never the seller's contact details.
            id: listing.id,
            slug: listing.slug,
            category: listing.category,
            title: listing.title,
            priceAed: listing.priceAed,
            negotiable: listing.negotiable,
            year: listing.year,
            mileageKm: listing.mileageKm,
            emirate: listing.emirate,
            photos: listing.photos.slice(0, 1),
            photoCount: listing.photoCount,
            featured: listing.featured,
            urgent: listing.urgent,
          }}
        />
      )}
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
      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Main column */}
        <div className="relative min-w-0">
          {/* Where am I: breadcrumb on larger screens, a back button on phones */}
          <nav
            aria-label={t("breadcrumb")}
            className="mb-4 hidden items-center gap-2 text-sm text-muted-foreground sm:flex"
          >
            <Link href="/" className="transition-colors hover:text-foreground">
              {tn("home")}
            </Link>
            <ChevronRight className="size-3.5 rtl:rotate-180" aria-hidden />
            <Link
              href={`/${listing.category}`}
              className="transition-colors hover:text-foreground"
            >
              {tn(listing.category)}
            </Link>
            <ChevronRight className="size-3.5 rtl:rotate-180" aria-hidden />
            <Link
              href={`/${listing.category}?make=${encodeURIComponent(listing.make)}`}
              className="transition-colors hover:text-foreground"
            >
              {listing.make}
            </Link>
          </nav>
          <BackButton
            fallbackHref={`/${listing.category}`}
            label={t("backToResults")}
            className="absolute start-0 top-3 z-20 sm:hidden"
          />
          {listing.photos.length > 0 ? (
            <ListingGallery
              photos={listing.photos}
              title={listing.title}
              badges={badges}
            />
          ) : (
            <div className="relative -mx-4 flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-primary/85 to-ink sm:mx-0 sm:aspect-[16/10] sm:rounded-2xl">
              <Icon
                className="size-20 text-primary-foreground/40"
                aria-hidden
              />
              {badges && (
                <div className="absolute start-3 top-3 flex gap-1.5">
                  {badges}
                </div>
              )}
            </div>
          )}

          {/* Title / price: on phones it slides up over the photo like a sheet */}
          <div className="relative z-10 -mx-4 -mt-5 rounded-t-[1.75rem] bg-background px-4 pt-3 sm:mx-0 sm:mt-6 sm:rounded-none sm:p-0">
            <div
              className="mx-auto mb-4 h-1 w-10 rounded-full bg-foreground/10 sm:hidden"
              aria-hidden
            />
            <h1 className="font-heading text-[1.6rem] leading-tight font-bold tracking-tight sm:text-3xl">
              {listing.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <PriceDisplay
                amountAed={listing.priceAed}
                className="font-heading text-[1.75rem] font-extrabold sm:text-3xl"
              />
              {listing.negotiable && (
                <span className="rounded-lg bg-success/10 px-2 py-1 text-xs font-semibold text-success">
                  {tl("negotiable")}
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-4 text-accent" aria-hidden />
                {locationLabel}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-4" aria-hidden />
                {t("postedOn", { date: postedDate })}
              </span>
            </div>

            {/* Key facts */}
            <ul
              aria-label={t("keyFacts")}
              className="scrollbar-none -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0"
            >
              {highlights.map(({ icon: HIcon, label }) => (
                <li
                  key={label}
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border bg-card px-3 text-sm font-medium"
                >
                  <HIcon className="size-4 text-accent" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>

            {/* Actions */}
            <div className="mt-4 flex items-center gap-2">
              <FavoriteButton
                key={listing.id}
                listingId={listing.id}
                initial={favorited}
                className="h-11 flex-1 rounded-xl sm:h-9 sm:flex-none"
              />
              <ShareButton
                title={listing.title}
                className="h-11 flex-1 rounded-xl sm:h-9 sm:flex-none"
              />
              <ReportDialog
                listingId={listing.id}
                requireGuestContact={!session?.user?.id}
                triggerClassName="h-11 w-11 shrink-0 rounded-xl border sm:h-9 sm:w-auto sm:border-0"
                labelClassName="sr-only sm:not-sr-only"
              />
            </div>
          </div>

          {/* Specifications */}
          <section className="mt-8">
            <h2 className="font-heading text-xl font-bold">{t("specs")}</h2>
            <div className="mt-4">
              <SpecList specs={specs} />
            </div>
          </section>

          {/* Description */}
          <section className="mt-8">
            <h2 className="font-heading text-xl font-bold">
              {t("description")}
            </h2>
            <div className="mt-3">
              <ExpandableText
                text={listing.description}
                moreLabel={t("readMore")}
                lessLabel={t("showLess")}
              />
            </div>
          </section>

          {/* Social video */}
          {video && (
            <section className="mt-8">
              <h2 className="font-heading text-xl font-bold">{t("video")}</h2>
              {video.embedUrl ? (
                <div className="mt-4 aspect-video overflow-hidden rounded-2xl border">
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
                <Button
                  variant="outline"
                  className="mt-4 h-11 rounded-xl"
                  render={
                    <a
                      href={video.watchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <ExternalLink className="size-4" aria-hidden />
                  {t("watchOn", { provider: video.provider })}
                </Button>
              )}
            </section>
          )}
        </div>

        {/* Seller panel */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="mb-3 font-heading text-xl font-bold lg:sr-only">
            {t("sellerTitle")}
          </h2>
          <div className="overflow-hidden rounded-3xl border bg-card shadow-[0_20px_50px_-30px_oklch(0.2_0.05_258/0.35)]">
            <div className="relative isolate overflow-hidden bg-ink p-5 text-ink-foreground">
              <div
                aria-hidden
                className="absolute -end-10 -top-16 -z-10 size-44 rounded-full bg-accent/25 blur-3xl"
              />
              <div className="flex items-center gap-3">
                <Avatar className="size-14 ring-2 ring-accent/60">
                  <AvatarFallback className="bg-accent font-heading text-lg font-bold text-accent-foreground">
                    {/* Same name as the label beside it (the dealer name for dealers). */}
                    {Array.from(sellerName.trim())[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 font-heading text-lg font-bold">
                    <span className="truncate">{sellerName}</span>
                    {listing.seller.verified && (
                      <BadgeCheck
                        className="size-5 shrink-0 text-success"
                        aria-label={t("verified")}
                      />
                    )}
                  </p>
                  <p className="text-xs text-white/60">
                    {t(listing.seller.type)} ·{" "}
                    {t("memberSince", { year: listing.seller.since })}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-4 hidden flex-col gap-2 lg:flex">
                <Button
                  size="lg"
                  className="h-12 rounded-xl text-base"
                  render={<a href={telHref} />}
                >
                  <Phone className="size-4" aria-hidden />
                  {t("call")}
                </Button>
                <Button
                  size="lg"
                  className="h-12 rounded-xl bg-[#25D366] text-base text-white hover:bg-[#1ebe5b]"
                  render={
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <MessageCircle className="size-4" aria-hidden />
                  {t("whatsapp")}
                </Button>
              </div>
              <p className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                <ShieldCheck
                  className="size-4 shrink-0 text-success"
                  aria-hidden
                />
                {t("safetyNote")}
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Phones: contact stays one tap away while scrolling */}
      <div className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 lg:hidden">
        <div className="glass mx-auto flex max-w-xl items-center gap-2 rounded-[1.4rem] border border-foreground/[0.06] p-2 ps-4 shadow-[0_18px_40px_-18px_oklch(0.2_0.05_258/0.45)]">
          <div className="min-w-0 flex-1">
            <PriceDisplay
              amountAed={listing.priceAed}
              className="block truncate font-heading text-base font-extrabold"
            />
            <p className="truncate text-xs text-muted-foreground">
              {sellerName}
            </p>
          </div>
          <Button
            size="lg"
            aria-label={t("call")}
            className="h-12 shrink-0 rounded-2xl px-4 max-[399px]:w-12 max-[399px]:px-0"
            render={<a href={telHref} />}
          >
            <Phone className="size-[1.1rem]" aria-hidden />
            <span className="max-[399px]:sr-only">{t("call")}</span>
          </Button>
          <Button
            size="lg"
            aria-label={t("whatsapp")}
            className="h-12 shrink-0 rounded-2xl bg-[#25D366] px-4 text-white hover:bg-[#1ebe5b] max-[339px]:w-12 max-[339px]:px-0"
            render={
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <MessageCircle className="size-4" aria-hidden />
            <span className="max-[339px]:sr-only">{t("whatsapp")}</span>
          </Button>
        </div>
      </div>

      {/* Similar listings */}
      {similar.length > 0 && (
        <section className="mt-12">
          <h2 className="font-heading text-2xl font-bold tracking-tight">
            {t("similar")}
          </h2>
          <div className="mt-5">
            <Rail className="sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {similar.map((l) => (
                <div key={l.slug} className={railItem}>
                  <ListingCard listing={l} />
                </div>
              ))}
            </Rail>
          </div>
        </section>
      )}
    </div>
  );
}
