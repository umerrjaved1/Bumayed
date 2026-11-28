import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Sparkles, ShieldCheck, Store } from "lucide-react";
import { ListingCard } from "@/components/shared/listing-card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { Rail } from "@/components/motion/rail";
import { railItem } from "@/components/motion/rail-item";
import { auth } from "@/auth";
import {
  getFeaturedListings,
  getLatestListings,
  getMakesWithListings,
  searchPublicListings,
} from "@/modules/listings/service";
import { parseListingQuery } from "@/modules/listings/query";
import { Link } from "@/i18n/navigation";
import { ListeoFanHero } from "@/components/shared/listeo-fan-hero";
import { ListeoCategoryCloud } from "@/components/shared/listeo-category-cloud";
import { ListeoTrustCommunity } from "@/components/shared/listeo-trust-community";

export const dynamic = "force-dynamic";

const CATEGORY_IMAGES = {
  cars: "/seed-photos/mercedes-g63-amg-2024.jpg",
  motorcycles: "/seed-photos/harley-fat-boy-114-2021.jpg",
  boats: "/seed-photos/gulf-craft-majesty-62-2020.jpg",
} as const;

async function countLive(category: "cars" | "motorcycles" | "boats") {
  const { total } = await searchPublicListings(parseListingQuery({}, category));
  return total;
}

function SectionHeading({
  title,
  subtitle,
  badge,
  action,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: { href: string; label: string };
}) {
  return (
    <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div>
        {badge && (
          <span className="text-xs font-bold uppercase tracking-wider text-primary mb-1 inline-block">
            {badge}
          </span>
        )}
        <h2 className="font-heading text-2xl sm:text-4xl leading-tight font-extrabold tracking-tight text-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1.5 max-w-xl text-sm sm:text-base text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition-all hover:border-primary hover:bg-primary/10 active:scale-95 sm:gap-2"
        >
          {action.label}
          <ArrowRight
            className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
            aria-hidden
          />
        </Link>
      )}
    </Reveal>
  );
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tc = await getTranslations("categories");

  let featured: any[] = [];
  let recent: any[] = [];
  let popularMakes: string[] = [];
  let session = null;
  let carCount = 0;
  let motoCount = 0;
  let boatCount = 0;

  try {
    const results = await Promise.all([
      getFeaturedListings(6),
      getLatestListings(12),
      getMakesWithListings("cars"),
      auth(),
      countLive("cars"),
      countLive("motorcycles"),
      countLive("boats"),
    ]);
    featured = results[0];
    recent = results[1];
    popularMakes = results[2];
    session = results[3];
    carCount = results[4];
    motoCount = results[5];
    boatCount = results[6];
  } catch (err) {
    console.warn("Database offline, using fallback sample data for visual preview");
    const { MOCK_LISTINGS } = await import("@/lib/mock/listings");
    const formatted = MOCK_LISTINGS.map((m) => ({
      ...m,
      slug: m.id,
      cityAr: m.city,
      photos: [
        m.category === "cars"
          ? CATEGORY_IMAGES.cars
          : m.category === "motorcycles"
            ? CATEGORY_IMAGES.motorcycles
            : CATEGORY_IMAGES.boats,
      ],
      seller: {
        ...m.seller,
        phone: m.seller.phone,
        whatsapp: m.seller.whatsapp,
      },
    }));
    featured = formatted.slice(0, 5);
    recent = formatted.slice(0, 8);
    popularMakes = ["Toyota", "Nissan", "Mercedes-Benz", "Porsche", "BMW"];
    carCount = 12;
    motoCount = 4;
    boatCount = 3;
  }

  const makes = popularMakes.length > 0 ? popularMakes : ["Toyota", "Nissan", "Mercedes-Benz", "BMW", "Porsche", "Yamaha"];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Listeo Home-8 Fan Hero Section */}
      <ListeoFanHero
        featuredListings={featured}
        titlePrefix={locale === "ar" ? "اكتشف أفضل" : "Discover The"}
        titleAccent={locale === "ar" ? "السيارات والمركبات" : "Best Motors"}
        titleSuffix={locale === "ar" ? "في الإمارات" : "in the UAE"}
        subtitle={
          locale === "ar"
            ? "سوق الإمارات الأول للسيارات، الدراجات النارية والقوارب مع تواصل مباشر عبر واتساب"
            : "Browse verified cars, motorcycles, and boats directly from verified sellers and dealers across all 7 emirates."
        }
        popularSearchesLabel={locale === "ar" ? "أشهر الماركات" : "Popular Searches"}
        popularMakes={makes}
      />

      {/* 2. Listeo-Style Category Cloud / Bento */}
      <ListeoCategoryCloud
        heading={locale === "ar" ? "كل ما تبحث عنه، في مكان واحد" : "Whatever You Need, It's Right Here"}
        subheading={
          locale === "ar"
            ? "تصفح أكبر تشكيلة من المركبات المعتمدة في دولة الإمارات"
            : "Explore premier motor categories curated with verified specifications and direct seller contact."
        }
        carCount={carCount}
        motoCount={motoCount}
        boatCount={boatCount}
        carImage={CATEGORY_IMAGES.cars}
        motoImage={CATEGORY_IMAGES.motorcycles}
        boatImage={CATEGORY_IMAGES.boats}
      />

      {/* 3. Featured / Trending Listings Carousel */}
      {featured.length > 0 && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              badge={locale === "ar" ? "مختارات حصرية" : "Verified Quality"}
              title={locale === "ar" ? "إعلانات مميزة مختارة" : "Trending Listings"}
              subtitle={
                locale === "ar"
                  ? "مركبات تم التحقق منها بجودة عالية ومواصفات خليجية"
                  : "A curated selection of verified vehicles from top-rated sellers."
              }
              action={{
                href: "/cars?sort=newest",
                label: locale === "ar" ? "عرض جميع الإعلانات" : "Browse all",
              }}
            />

            <Rail className="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featured.map((listing) => (
                <div key={listing.id} className={railItem}>
                  <ListingCard listing={listing} />
                </div>
              ))}
            </Rail>
          </div>
        </section>
      )}

      {/* 4. Latest Added Listings Grid */}
      <section className="py-16 bg-muted/20 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge={locale === "ar" ? "أحدث الإضافات" : "Fresh Arrivals"}
            title={locale === "ar" ? "أحدث المركبات المعروضة" : "Latest Listings in the UAE"}
            subtitle={
              locale === "ar"
                ? "إعلانات جديدة تضاف يومياً في دبي، أبوظبي وجميع الإمارات"
                : "Explore the most recent cars, motorcycles, and boats added to our catalog."
            }
            action={{
              href: "/cars",
              label: locale === "ar" ? "عرض المزيد" : "View all vehicles",
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recent.slice(0, 8).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Listeo-Style Trust, Reviews & Community Section */}
      <ListeoTrustCommunity />

      {/* 6. Dealer Callout Banner */}
      <section className="py-16 bg-card border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 sm:p-12 border border-primary/20">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary mb-4">
                <Store className="size-3.5" />
                <span>Showroom & Dealership Network</span>
              </span>
              <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
                {locale === "ar" ? "هل أنت صاحب معرض أو وكالة سيارات؟" : "Are you an automotive dealer in the UAE?"}
              </h3>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                {locale === "ar"
                  ? "انضم إلى شبكة المعارض المعتمدة، احصل على شارة الوكيل المعتمد، واستقبل استفسارات المشترين المباشرة فوراً."
                  : "Expand your reach across the UAE with verified dealer status, bulk inventory tools, and direct customer WhatsApp leads."}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/auth/register?role=dealer"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
                >
                  {locale === "ar" ? "سجل كمعرض سيارات" : "Join as a Verified Dealer"}
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-background px-6 py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted"
                >
                  {locale === "ar" ? "تواصل مع فريق المبيعات" : "Contact Dealer Support"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
