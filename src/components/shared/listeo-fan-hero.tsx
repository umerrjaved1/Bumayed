"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { SearchBar } from "@/components/shared/search-bar";
import { ListingPublicDto } from "@/modules/listings/types";
import { BadgeCheck, Sparkles, MapPin, Gauge, Calendar, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";

interface ListeoFanHeroProps {
  featuredListings: ListingPublicDto[];
  titlePrefix: string;
  titleAccent: string;
  titleSuffix: string;
  subtitle: string;
  popularSearchesLabel?: string;
  popularMakes?: string[];
}

export function ListeoFanHero({
  featuredListings,
  titlePrefix,
  titleAccent,
  titleSuffix,
  subtitle,
  popularSearchesLabel = "Popular Makes",
  popularMakes = ["Toyota", "Nissan", "Mercedes-Benz", "BMW", "Porsche", "Yamaha"],
}: ListeoFanHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto rotate the fan carousel every 5 seconds if not hovered
  useEffect(() => {
    if (featuredListings.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % featuredListings.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [featuredListings.length, isHovered]);

  const currentListing = featuredListings[activeIndex] || featuredListings[0];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-card/60 via-background to-background pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* Decorative SVG curved waves / lines (inspired by Listeo Home-8 hero) */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-40 dark:opacity-20">
        <svg
          className="absolute -top-10 start-1/2 h-[650px] w-[1400px] -translate-x-1/2 rtl:translate-x-1/2 stroke-primary/20 dark:stroke-primary/30"
          viewBox="0 0 1400 650"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 180 C 350 40, 750 320, 1100 120 S 1350 220, 1450 380"
            strokeWidth="2"
            strokeDasharray="6 6"
          />
          <path
            d="M-50 280 C 250 140, 650 420, 1000 220 S 1300 320, 1400 480"
            strokeWidth="1.5"
          />
          <path
            d="M100 380 C 400 240, 800 520, 1150 320 S 1400 420, 1500 580"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md sm:text-sm">
            <Sparkles className="size-3.5 animate-pulse" />
            <span>UAE&apos;s Verified Motors Marketplace</span>
          </div>

          {/* Heading with styled curved underline */}
          <h1 className="font-heading mt-5 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {titlePrefix}{" "}
            <span className="relative inline-block text-primary">
              {titleAccent}
              <svg
                className="absolute -bottom-2.5 start-0 w-full text-accent"
                viewBox="0 0 200 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <path
                  d="M4 12 C 50 3, 150 3, 196 11"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            {titleSuffix}
          </h1>

          <p className="mt-5 text-base text-muted-foreground sm:text-lg lg:text-xl">
            {subtitle}
          </p>

          {/* Search Box */}
          <div className="mt-8">
            <SearchBar />
          </div>

          {/* Popular Makes Marquee/Chips */}
          {popularMakes.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm">
              <span className="text-muted-foreground font-medium">{popularSearchesLabel}:</span>
              {popularMakes.slice(0, 6).map((make) => (
                <Link
                  key={make}
                  href={`/cars?make=${encodeURIComponent(make)}`}
                  className="rounded-full bg-muted/80 px-3 py-1 font-medium text-foreground transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-sm"
                >
                  {make}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 3D Fan Carousel of Verified Featured Vehicles */}
        {featuredListings && featuredListings.length > 0 && (
          <div
            className="mt-14 lg:mt-20"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="relative mx-auto max-w-5xl">
              {/* Fan Perspective Wrap */}
              <div className="relative flex h-[380px] sm:h-[440px] md:h-[480px] w-full items-center justify-center [perspective:1200px]">
                {featuredListings.slice(0, 5).map((listing, index) => {
                  const offset = (index - activeIndex + featuredListings.length) % featuredListings.length;
                  const normalizedOffset =
                    offset > Math.floor(featuredListings.length / 2)
                      ? offset - featuredListings.length
                      : offset;

                  const isCurrent = normalizedOffset === 0;
                  const isAdjacent = Math.abs(normalizedOffset) === 1;
                  const isVisible = Math.abs(normalizedOffset) <= 2;

                  if (!isVisible) return null;

                  // Transform calculations for the 3D fan curvature
                  const rotateY = normalizedOffset * -14;
                  const translateX = normalizedOffset * 170;
                  const translateZ = -Math.abs(normalizedOffset) * 110;
                  const scale = 1 - Math.abs(normalizedOffset) * 0.12;
                  const zIndex = 30 - Math.abs(normalizedOffset) * 10;
                  const opacity = isCurrent ? 1 : isAdjacent ? 0.85 : 0.45;

                  return (
                    <div
                      key={listing.id}
                      onClick={() => setActiveIndex(index)}
                      style={{
                        transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                        zIndex,
                        opacity,
                      }}
                      className={`absolute top-0 w-[290px] sm:w-[360px] md:w-[420px] transition-all duration-700 ease-out cursor-pointer select-none rounded-2xl bg-card border border-border shadow-2xl overflow-hidden group ${
                        isCurrent ? "ring-2 ring-primary/60 shadow-primary/10" : "hover:opacity-95"
                      }`}
                    >
                      {/* Image Preview */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                        <Image
                          src={listing.photos[0] || "/seed-photos/toyota-land-cruiser-gxr-2022.jpg"}
                          alt={listing.title}
                          fill
                          sizes="(max-width: 640px) 290px, (max-width: 768px) 360px, 420px"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          priority={index === 0}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/90 px-2.5 py-0.5 text-xs font-semibold text-white shadow backdrop-blur-md">
                            <BadgeCheck className="size-3.5" />
                            Verified
                          </span>
                          <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-bold text-amber-400 backdrop-blur-md">
                            AED {listing.priceAed.toLocaleString()}
                          </span>
                        </div>

                        {/* Title & Quick Specs overlay on card */}
                        <div className="absolute bottom-3 inset-x-3 text-white">
                          <h3 className="line-clamp-1 font-bold text-base sm:text-lg drop-shadow-sm">
                            {listing.year} {listing.make} {listing.model}
                          </h3>
                          <div className="mt-1 flex items-center gap-3 text-xs text-zinc-300">
                            <span className="flex items-center gap-1">
                              <MapPin className="size-3 text-amber-400" />
                              {listing.emirate}
                            </span>
                            {listing.mileageKm !== null && (
                              <span className="flex items-center gap-1">
                                <Gauge className="size-3" />
                                {listing.mileageKm.toLocaleString()} km
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Info */}
                      <div className="p-3.5 bg-card flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                            {listing.seller.type === "dealer" ? "D" : "I"}
                          </div>
                          <div>
                            <p className="text-xs font-semibold line-clamp-1 text-foreground">
                              {listing.seller.dealerName || listing.seller.name}
                            </p>
                            <span className="text-[10px] text-muted-foreground capitalize">
                              {listing.seller.type} seller
                            </span>
                          </div>
                        </div>

                        <Link
                          href={`/${listing.category}/${listing.slug}`}
                          className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Slider Controls (Prev, Next, Dots) */}
              <div className="mt-6 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex((prev) =>
                      prev === 0 ? featuredListings.length - 1 : prev - 1
                    )
                  }
                  aria-label="Previous vehicle"
                  className="size-9 rounded-full border border-border bg-card text-foreground flex items-center justify-center shadow-sm hover:bg-muted transition-colors active:scale-95"
                >
                  <ChevronLeft className="size-4 rtl:rotate-180" />
                </button>

                <div className="flex items-center gap-1.5">
                  {featuredListings.slice(0, 5).map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={() => setActiveIndex(dotIdx)}
                      aria-label={`Go to slide ${dotIdx + 1}`}
                      className={`h-2 transition-all rounded-full ${
                        dotIdx === activeIndex
                          ? "w-7 bg-primary"
                          : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex((prev) => (prev + 1) % featuredListings.length)
                  }
                  aria-label="Next vehicle"
                  className="size-9 rounded-full border border-border bg-card text-foreground flex items-center justify-center shadow-sm hover:bg-muted transition-colors active:scale-95"
                >
                  <ChevronRight className="size-4 rtl:rotate-180" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
