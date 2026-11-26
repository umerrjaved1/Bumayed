import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Car,
  CircleGauge,
  Ship,
  Megaphone,
  MessagesSquare,
  BadgeCheck,
} from "lucide-react";
import { SearchBar } from "@/components/shared/search-bar";
import { CategoryCard } from "@/components/shared/category-card";
import { ListingCard } from "@/components/shared/listing-card";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import {
  getFeaturedListings,
  getLatestListings,
  getMakesWithListings,
} from "@/modules/listings/service";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tc = await getTranslations("categories");

  const [featured, recent, popularMakes, session] = await Promise.all([
    getFeaturedListings(6),
    getLatestListings(12),
    // Only makes with live ads, so no chip leads to an empty results page.
    getMakesWithListings("cars"),
    auth(),
  ]);
  // Featured ads already have their own row; don't show them twice.
  const featuredSlugs = new Set(featured.map((l) => l.slug));
  const latest = recent.filter((l) => !featuredSlugs.has(l.slug)).slice(0, 6);

  // Dealers go straight to packages; everyone else signs up as a dealer first.
  const role = session?.user?.role;
  const dealerCtaHref =
    role === "DEALER" || role === "SUPER_ADMIN"
      ? "/dashboard/packages"
      : session?.user
        ? "/dashboard"
        : "/auth/register?type=dealer";

  const categories = [
    { key: "cars", href: "/cars", icon: Car },
    { key: "motorcycles", href: "/motorcycles", icon: CircleGauge },
    { key: "boats", href: "/boats", icon: Ship },
  ] as const;

  const steps = [
    { icon: Megaphone, title: t("howStep1Title"), body: t("howStep1Body") },
    {
      icon: MessagesSquare,
      title: t("howStep2Title"),
      body: t("howStep2Body"),
    },
    { icon: BadgeCheck, title: t("howStep3Title"), body: t("howStep3Body") },
  ];

  return (
    <div>
      {/* Hero / search */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-primary-foreground/80 sm:text-lg">
            {t("heroSubtitle")}
          </p>
          <div className="mt-8 max-w-3xl">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Category shortcuts */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("browseCategories")}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(({ key, href, icon }) => (
            <CategoryCard
              key={key}
              href={href}
              icon={icon}
              title={tc(key)}
              description={tc(`${key}Description`)}
            />
          ))}
        </div>
      </section>

      {/* Featured ads — from PostgreSQL (Phase 3) */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("featuredAds")}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((listing) => (
            <ListingCard key={listing.slug} listing={listing} />
          ))}
        </div>
      </section>

      {/* Popular makes */}
      {popularMakes.length > 0 && (
        <section className="border-t bg-muted/50">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold tracking-tight">
              {t("popularMakes")}
            </h2>
            <div className="mt-6 flex flex-wrap gap-2">
              {popularMakes.map((make) => (
                <Badge
                  key={make}
                  variant="secondary"
                  className="h-10 px-4 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  render={
                    <Link href={`/cars?make=${encodeURIComponent(make)}`} />
                  }
                >
                  {make}
                </Badge>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest ads */}
      {latest.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            {t("latestAds")}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((listing) => (
              <ListingCard key={listing.slug} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {/* Dealer promotion */}
      <section className="border-y bg-secondary">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {t("dealerPromoTitle")}
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              {t("dealerPromoBody")}
            </p>
          </div>
          <Button size="lg" render={<Link href={dealerCtaHref} />}>
            {t("dealerPromoCta")}
          </Button>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("howItWorks")}
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <div key={i} className="rounded-lg border bg-card p-6">
              <Icon className="size-8 text-accent" aria-hidden />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
