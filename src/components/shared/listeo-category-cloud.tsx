"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Car, CircleGauge, Ship, ArrowUpRight } from "lucide-react";

interface CategoryCloudProps {
  heading: string;
  subheading: string;
  carCount: number;
  motoCount: number;
  boatCount: number;
  carImage?: string;
  motoImage?: string;
  boatImage?: string;
}

export function ListeoCategoryCloud({
  heading,
  subheading,
  carCount,
  motoCount,
  boatCount,
  carImage = "/seed-photos/mercedes-g63-amg-2024.jpg",
  motoImage = "/seed-photos/harley-fat-boy-114-2021.jpg",
  boatImage = "/seed-photos/gulf-craft-majesty-62-2020.jpg",
}: CategoryCloudProps) {
  const categories = [
    {
      title: "Cars",
      titleAr: "سيارات",
      href: "/cars",
      count: carCount,
      icon: Car,
      image: carImage,
      tagline: "Sedans, SUVs, Coupes & Luxury",
      size: "large", // spans 2 cols on desktop bento
    },
    {
      title: "Motorcycles",
      titleAr: "دراجات نارية",
      href: "/motorcycles",
      count: motoCount,
      icon: CircleGauge,
      image: motoImage,
      tagline: "Cruisers, Sportbikes & Touring",
      size: "medium",
    },
    {
      title: "Boats & Marine",
      titleAr: "قوارب ويخوت",
      href: "/boats",
      count: boatCount,
      icon: Ship,
      image: boatImage,
      tagline: "Yachts, Speedboats & Jet Skis",
      size: "medium",
    },
  ];

  return (
    <section className="py-16 bg-muted/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Popular Categories
            </span>
            <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-foreground mt-1.5">
              {heading}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-xl">
              {subheading}
            </p>
          </div>
        </div>

        {/* Listeo-style Bento Grid / Cloud */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            const isLarge = cat.size === "large";

            return (
              <Link
                key={cat.href}
                href={cat.href}
                className={`group relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${
                  isLarge ? "md:col-span-1" : "md:col-span-1"
                }`}
              >
                {/* Background Image with Dark Vignette */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

                  {/* Top Category Icon & Count Tag */}
                  <div className="absolute top-4 inset-x-4 flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md shadow-inner transition-transform group-hover:scale-110">
                      <Icon className="size-5" />
                    </span>
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-sm">
                      {cat.count} Listings
                    </span>
                  </div>

                  {/* Bottom Information */}
                  <div className="absolute bottom-4 inset-x-4 text-white flex items-end justify-between">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold font-heading group-hover:text-amber-300 transition-colors">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-zinc-300 mt-1 line-clamp-1">
                        {cat.tagline}
                      </p>
                    </div>

                    <div className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all group-hover:bg-primary group-hover:text-primary-foreground rtl:rotate-90">
                      <ArrowUpRight className="size-4" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
