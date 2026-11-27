import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowRight,
  BadgeCheck,
  Car,
  CircleGauge,
  Hash,
  Languages,
  Megaphone,
  MessagesSquare,
  ShieldCheck,
  Ship,
  Store,
} from "lucide-react";
import { SearchBar } from "@/components/shared/search-bar";
import { CategoryCard } from "@/components/shared/category-card";
import { PlateBadge } from "@/components/shared/plate-badge";
import { ListingCard } from "@/components/shared/listing-card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { Spotlight } from "@/components/motion/spotlight";
import { CountUp } from "@/components/motion/count-up";
import { Rail } from "@/components/motion/rail";
import { railItem } from "@/components/motion/rail-item";
import { getSession } from "@/lib/session";
import { getHomeData } from "@/modules/listings/cache";
import { selectedCountry } from "@/lib/country";
import {
  getActiveCountryCodes,
  getRegionsWithCities,
} from "@/modules/locations/service";
import { RecentlyViewedRail } from "@/components/shared/recently-viewed";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

const CATEGORY_IMAGES = {
  cars: "/seed-photos/mercedes-g63-amg-2024.jpg",
  motorcycles: "/seed-photos/harley-fat-boy-114-2021.jpg",
  boats: "/seed-photos/gulf-craft-majesty-62-2020.jpg",
} as const;

const HERO_IMAGE = "/seed-photos/toyota-land-cruiser-gxr-2022.jpg";

function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: { href: string; label: string };
}) {
  return (
    <Reveal className="flex items-end justify-between gap-4">
      <div>
        <h2 className="font-heading text-[1.7rem] leading-tight font-bold tracking-tight sm:text-4xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground sm:mt-2 sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-all hover:border-accent hover:bg-accent/10 active:scale-95 sm:gap-2 sm:px-4"
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
  const tcommon = await getTranslations("common");

  // Public rows and counts come from a short-lived shared cache (see cache.ts).
  const country = await selectedCountry();
  // UAE keeps its own wording ("7 emirates"); every other view says GCC / regions.
  const inUae = country === "AE";
  const activeCountries = await getActiveCountryCodes();
  const [{ featured, latest, popularMakes, counts }, session, regions] =
    await Promise.all([
      getHomeData(country),
      getSession(),
      // Regions of the selected country for the search box (none for the whole GCC).
      country ? getRegionsWithCities(country) : Promise.resolve([]),
    ]);
  const {
    cars: carCount,
    motorcycles: motoCount,
    boats: boatCount,
    plates: plateCount,
  } = counts;
  const totalLive = carCount + motoCount + boatCount + plateCount;

  // Dealers go straight to packages; everyone else signs up as a dealer first.
  const role = session?.user?.role;
  const dealerCtaHref =
    role === "DEALER" || role === "SUPER_ADMIN"
      ? "/dashboard/packages"
      : session?.user
        ? "/dashboard"
        : "/auth/register?type=dealer";

  const categories = [
    { key: "cars", href: "/cars", icon: Car, count: carCount },
    {
      key: "motorcycles",
      href: "/motorcycles",
      icon: CircleGauge,
      count: motoCount,
    },
    { key: "boats", href: "/boats", icon: Ship, count: boatCount },
    { key: "plates", href: "/plates", icon: Hash, count: plateCount },
  ].filter(
    // Number plates are issued per UAE emirate, so only the UAE (or all of the GCC) lists them.
    (c) => c.key !== "plates" || country === undefined || country === "AE",
  ) as {
    key: "cars" | "motorcycles" | "boats" | "plates";
    href: string;
    icon: typeof Car;
    count: number;
  }[];

  const steps = [
    { icon: Megaphone, title: t("howStep1Title"), body: t("howStep1Body") },
    {
      icon: MessagesSquare,
      title: t("howStep2Title"),
      body: t("howStep2Body"),
    },
    { icon: BadgeCheck, title: t("howStep3Title"), body: t("howStep3Body") },
  ];

  const trust = [
    { icon: ShieldCheck, label: t("trustModerated") },
    { icon: Store, label: t("trustDealers") },
    { icon: Languages, label: t("trustBilingual") },
  ];

  const stats = [
    { value: totalLive, label: t("statLive") },
    country
      ? {
          value: regions.length,
          label: country === "AE" ? t("statEmirates") : t("statRegions"),
        }
      : { value: activeCountries.length, label: t("statCountries") },
    { value: 2, label: t("statLanguages") },
  ];

  return (
    <div className="overflow-x-clip">
      {/* ---------------- Hero ---------------- */}
      <section className="relative isolate -mt-px overflow-hidden bg-ink text-ink-foreground">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 animate-ken-burns object-cover opacity-45"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/70 via-ink/80 to-ink" />
        <div className="absolute inset-0 -z-10 bg-grid mask-fade-b opacity-60" />
        {/* Ambient glows */}
        <div
          aria-hidden
          className="absolute end-[-10%] -top-32 -z-10 size-[520px] animate-float rounded-full bg-accent/25 blur-[120px]"
        />
        <div
          aria-hidden
          className="absolute start-[-10%] -bottom-40 -z-10 size-[480px] rounded-full bg-primary/60 blur-[120px]"
        />

        <div className="mx-auto max-w-7xl px-4 pt-10 pb-14 sm:px-6 sm:pt-24 sm:pb-28 lg:px-8">
          <div className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/85 backdrop-blur">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-success" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            {inUae ? t("heroEyebrow") : t("heroEyebrowGcc")}
          </div>

          <h1
            className="mt-6 max-w-4xl animate-fade-up font-heading text-4xl leading-[1.05] font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "80ms" }}
          >
            {t("heroTitleLead")}{" "}
            <span className="text-gradient-gold">{t("heroTitleAccent")}</span>
          </h1>
          <p
            className="mt-5 max-w-2xl animate-fade-up text-base text-white/70 sm:text-lg"
            style={{ animationDelay: "160ms" }}
          >
            {inUae ? t("heroSubtitle") : t("heroSubtitleGcc")}
          </p>

          <div
            className="mt-10 max-w-4xl animate-fade-up"
            style={{ animationDelay: "240ms" }}
          >
            <SearchBar
              popular={popularMakes}
              regions={regions}
              country={country}
              showPlates={country === undefined || country === "AE"}
            />
          </div>

          <ul
            className="mt-8 flex animate-fade-up flex-wrap gap-x-6 gap-y-3 text-sm text-white/70"
            style={{ animationDelay: "320ms" }}
          >
            {trust.map(({ icon: Icon, label }) => (
              <li key={label} className="inline-flex items-center gap-2">
                <Icon className="size-4 text-accent" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Stats strip */}
        <div className="border-t border-white/10 bg-white/[0.03] backdrop-blur">
          <dl className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-white/10 px-4 sm:px-6 lg:px-8">
            {stats.map((s) => (
              <div key={s.label} className="px-2 py-5 text-center sm:py-6">
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-heading text-2xl font-extrabold text-white sm:text-4xl">
                  <CountUp value={s.value} suffix={s.value > 10 ? "+" : ""} />
                </dd>
                <dd className="mt-1 text-xs text-white/60 sm:text-sm">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------------- Recently viewed (only for returning visitors) ---------------- */}
      <RecentlyViewedRail
        title={t("recentTitle")}
        subtitle={t("recentSubtitle")}
        clearLabel={tcommon("clear")}
      />

      {/* ---------------- Categories (bento) ---------------- */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <SectionHeading
          title={t("browseCategories")}
          subtitle={t("categoriesSubtitle")}
        />
        <div className="mt-7 sm:mt-10">
          <Rail className="sm:grid-cols-2 lg:grid-cols-5 lg:grid-rows-2">
            {categories.map(({ key, href, icon, count }, i) => (
              <Reveal
                key={key}
                delay={i * 110}
                className={
                  i === 0
                    ? `${railItem} sm:col-span-2 lg:col-span-3 lg:row-span-2`
                    : key === "plates"
                      ? `${railItem} sm:col-span-2 lg:col-span-5`
                      : `${railItem} lg:col-span-2`
                }
              >
                <CategoryCard
                  href={href}
                  icon={icon}
                  title={tc(key)}
                  description={tc(`${key}Description`)}
                  image={key === "plates" ? undefined : CATEGORY_IMAGES[key]}
                  visual={
                    key === "plates" ? (
                      <PlateBadge
                        emirate="DXB"
                        code="A"
                        number="7"
                        size="lg"
                        label=""
                      />
                    ) : undefined
                  }
                  countLabel={t("adsCount", { count })}
                  ctaLabel={t("explore")}
                  className={
                    i === 0
                      ? "h-full min-h-[22rem] sm:min-h-80 lg:min-h-[32rem]"
                      : key === "plates"
                        ? "h-full min-h-[18rem] sm:min-h-64"
                        : "h-full min-h-[22rem] sm:min-h-72"
                  }
                />
              </Reveal>
            ))}
          </Rail>
        </div>
      </section>

      {/* ---------------- Featured ---------------- */}
      {featured.length > 0 && (
        <section className="relative">
          <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-dots mask-fade-b opacity-60" />
          <div className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8">
            <SectionHeading
              title={t("featuredAds")}
              subtitle={t("featuredSubtitle")}
              action={{ href: "/cars", label: t("viewAll") }}
            />
            <div className="mt-7 sm:mt-10">
              <Rail className="sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                {featured.map((listing, i) => (
                  <Reveal
                    key={listing.slug}
                    delay={(i % 3) * 90}
                    className={`${railItem} h-auto sm:h-full`}
                  >
                    <ListingCard listing={listing} />
                  </Reveal>
                ))}
              </Rail>
            </div>
          </div>
        </section>
      )}

      {/* ---------------- Popular makes marquee ---------------- */}
      {popularMakes.length > 0 && (
        <section className="border-y bg-muted/40 py-10 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              title={t("popularMakes")}
              subtitle={t("makesSubtitle")}
            />
          </div>
          <div className="marquee mt-8 overflow-hidden mask-fade-x" dir="ltr">
            <ul className="marquee-track flex w-max gap-3">
              {[...popularMakes, ...popularMakes].map((make, i) => (
                <li
                  key={`${make}-${i}`}
                  aria-hidden={i >= popularMakes.length || undefined}
                >
                  <Link
                    href={`/cars?make=${encodeURIComponent(make)}`}
                    tabIndex={i >= popularMakes.length ? -1 : undefined}
                    className="group inline-flex h-14 items-center gap-3 rounded-2xl border bg-card px-5 font-heading text-base font-semibold whitespace-nowrap shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
                  >
                    <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-sm font-bold text-primary transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                      {make.slice(0, 1)}
                    </span>
                    {make}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ---------------- Latest ---------------- */}
      {latest.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <SectionHeading
            title={t("latestAds")}
            subtitle={t("latestSubtitle")}
            action={{ href: "/cars?sort=newest", label: t("viewAll") }}
          />
          <div className="mt-7 sm:mt-10">
            <Rail className="sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {latest.map((listing, i) => (
                <Reveal
                  key={listing.slug}
                  delay={(i % 3) * 90}
                  className={`${railItem} h-auto sm:h-full`}
                >
                  <ListingCard listing={listing} />
                </Reveal>
              ))}
            </Rail>
          </div>
        </section>
      )}

      {/* ---------------- How it works ---------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8">
        <SectionHeading title={t("howItWorks")} subtitle={t("howSubtitle")} />
        <div className="relative mt-7 sm:mt-10">
          <div
            aria-hidden
            className="absolute inset-x-[16%] top-14 hidden h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent md:block"
          />
          <ol className="grid gap-5 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, body }, i) => (
              <Reveal as="li" key={i} delay={i * 120}>
                <Spotlight className="group h-full rounded-3xl border bg-card p-7 transition-all duration-500 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_24px_48px_-24px_oklch(0.2_0.05_258/0.3)]">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-ink text-accent shadow-lg transition-transform duration-500 ease-[var(--ease-spring)] group-hover:scale-110 group-hover:-rotate-6">
                        <Icon className="size-6" aria-hidden />
                      </span>
                      <span className="font-heading text-5xl font-extrabold text-foreground/[0.06] tabular-nums transition-colors duration-500 group-hover:text-accent/30">
                        0{i + 1}
                      </span>
                    </div>
                    <h3 className="mt-6 font-heading text-lg font-bold">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {body}
                    </p>
                  </div>
                </Spotlight>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------- Dealer CTA ---------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-ink px-6 py-10 text-ink-foreground sm:px-12 sm:py-16">
            <div className="absolute inset-0 -z-10 bg-grid opacity-50" />
            <div
              aria-hidden
              className="absolute inset-0 -z-10 animate-gradient-pan bg-[linear-gradient(120deg,transparent_20%,color-mix(in_oklch,var(--accent)_28%,transparent)_50%,transparent_80%)] bg-[length:200%_200%]"
            />
            <div
              aria-hidden
              className="absolute -end-20 -top-20 -z-10 size-80 animate-float rounded-full bg-accent/30 blur-[100px]"
            />
            <div className="flex flex-col items-stretch gap-8 sm:items-start lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold tracking-wide text-accent uppercase">
                  <Store className="size-3.5" aria-hidden />
                  {t("ctaEyebrow")}
                </span>
                <h2 className="mt-4 font-heading text-3xl font-extrabold tracking-tight sm:text-5xl">
                  {t("dealerPromoTitle")}
                </h2>
                <p className="mt-4 text-base text-white/70 sm:text-lg">
                  {t("dealerPromoBody")}
                </p>
              </div>
              <Button
                variant="accent"
                size="xl"
                className="group w-full rounded-full px-7 font-semibold sm:w-auto"
                render={<Link href={dealerCtaHref} />}
              >
                {t("dealerPromoCta")}
                <ArrowRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                  aria-hidden
                />
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
