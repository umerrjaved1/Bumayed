import { getLocale, getTranslations } from "next-intl/server";
import { buildQueryString, parseListingQuery } from "@/modules/listings/query";
import {
  getKeywordMatchesElsewhere,
  getMakesForCategory,
  searchPublicListings,
} from "@/modules/listings/service";
import { Link } from "@/i18n/navigation";
import type {
  SearchParamsInput,
  VehicleCategoryCode,
} from "@/modules/listings/types";
import { FilterForm } from "@/components/shared/filters/filter-form";
import { MobileFilterDrawer } from "@/components/shared/filters/mobile-filter-drawer";
import { SortSelect } from "@/components/shared/sort-select";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { ListingCard } from "@/components/shared/listing-card";
import { EmptyState } from "@/components/shared/empty-state";

const CATEGORIES = ["cars", "motorcycles", "boats"] as const;

function flatten(sp: SearchParamsInput): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    const val = Array.isArray(v) ? v[0] : v;
    if (val) out[k] = val;
  }
  return out;
}

export async function CategoryResults({
  category,
  searchParams,
}: {
  category: VehicleCategoryCode;
  searchParams: SearchParamsInput;
}) {
  const tc = await getTranslations("categories");
  const tr = await getTranslations("results");
  const tn = await getTranslations("nav");

  const query = parseListingQuery(searchParams, category);
  const [{ items, total, page, totalPages }, makes] = await Promise.all([
    searchPublicListings(query),
    getMakesForCategory(category),
  ]);
  // Nothing here for this keyword: point to the categories where it does match.
  const elsewhere =
    items.length === 0 && query.keyword
      ? await getKeywordMatchesElsewhere(query.keyword, category)
      : [];
  const locale = await getLocale();
  const flat = flatten(searchParams);
  // Plain <a> links bypass the i18n router, so the locale prefix is added here.
  const basePath = `/${locale}/${category}`;
  // Remount the filter forms when the query changes so they never show stale values.
  const filterKey = JSON.stringify(flat);
  const activeFilters = Object.keys(flat).filter(
    (k) => k !== "sort" && k !== "page",
  ).length;

  return (
    <div>
      <header className="relative isolate overflow-hidden border-b bg-ink text-ink-foreground">
        <div className="bg-grid mask-fade-b absolute inset-0 -z-10 opacity-50" />
        <div
          aria-hidden
          className="animate-float absolute -top-24 end-0 -z-10 size-96 rounded-full bg-accent/20 blur-[110px]"
        />
        <div className="mx-auto max-w-7xl px-4 pt-7 pb-6 sm:px-6 sm:py-14 lg:px-8">
          <nav aria-label="Breadcrumb" className="animate-fade-in text-xs text-white/50">
            <Link href="/" className="transition-colors hover:text-accent">
              {tn("home")}
            </Link>
            <span className="mx-2" aria-hidden>
              /
            </span>
            <span className="text-white/80">{tc(category)}</span>
          </nav>
          <h1 className="animate-fade-up mt-2 font-heading text-[2rem] leading-tight font-extrabold tracking-tight sm:mt-3 sm:text-5xl">
            {tc(category)}
          </h1>
          <p
            className="animate-fade-up mt-2 max-w-2xl text-sm text-white/65 sm:mt-3 sm:text-base"
            style={{ animationDelay: "80ms" }}
          >
            {tc(`${category}Description`)}
          </p>
          <div
            className="animate-fade-up scrollbar-none -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0"
            style={{ animationDelay: "160ms" }}
          >
            {CATEGORIES.map((c) => (
              <Link
                key={c}
                href={`/${c}`}
                aria-current={c === category ? "page" : undefined}
                className={
                  c === category
                    ? "inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-accent-foreground shadow-[0_8px_20px_-10px_var(--accent)]"
                    : "inline-flex h-10 shrink-0 items-center rounded-full border border-white/15 bg-white/5 px-4 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 active:scale-95"
                }
              >
                {tc(c)}
                {c === category && (
                  <span className="rounded-full bg-accent-foreground/10 px-1.5 text-xs tabular-nums">
                    {total}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 sm:px-6 lg:mt-8 lg:grid-cols-[288px_1fr] lg:px-8">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border bg-card p-5 shadow-[0_12px_40px_-24px_oklch(0.2_0.05_258/0.25)]">
            <h2 className="mb-4 font-heading text-lg font-bold">{tr("filtersTitle")}</h2>
            <FilterForm
              key={filterKey}
              category={category}
              makes={makes}
              values={query}
            />
          </div>
        </aside>

        <div>
          <div className="sticky top-16 z-30 -mx-4 flex items-center gap-2 border-b bg-background/90 px-4 py-2.5 backdrop-blur-lg sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:justify-between lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
            <MobileFilterDrawer
              key={filterKey}
              category={category}
              makes={makes}
              values={query}
              activeCount={activeFilters}
            />
            <p className="hidden text-sm text-muted-foreground lg:block">
              {tr("count", { count: total })}
            </p>
            <SortSelect
              value={query.sort}
              currentParams={flat}
              className="h-10 min-w-0 flex-1 rounded-xl data-[size=default]:h-10 lg:w-52 lg:flex-none"
            />
          </div>

          {items.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title={tr("noResultsTitle")}
                body={tr("noResultsBody")}
                actionLabel={tr("clearFilters")}
                actionHref={`/${category}`}
              >
                {elsewhere.length > 0 && (
                  <ul className="mt-4 flex flex-wrap justify-center gap-2">
                    {elsewhere.map(({ category: other, count }) => (
                      <li key={other}>
                        <Link
                          href={`/${other}?keyword=${encodeURIComponent(query.keyword ?? "")}`}
                          className="inline-flex min-h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                          {tr("foundElsewhere", {
                            count,
                            category: tc(other),
                          })}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </EmptyState>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:mt-6 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
              {items.map((listing, i) => (
                <div
                  key={listing.slug}
                  className="animate-fade-up h-full"
                  style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                >
                  <ListingCard listing={listing} priority={i < 3} />
                </div>
              ))}
            </div>
          )}

          <PaginationControls
            page={page}
            totalPages={totalPages}
            hrefForPage={(p) =>
              `${basePath}${buildQueryString(flat, { page: p })}`
            }
            labels={{
              previous: tr("previous"),
              next: tr("next"),
              previousPage: tr("previousPage"),
              nextPage: tr("nextPage"),
            }}
          />
        </div>
      </div>
    </div>
  );
}
