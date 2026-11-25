import { getTranslations } from "next-intl/server";
import { buildQueryString, parseListingQuery } from "@/modules/listings/query";
import {
  getMakesForCategory,
  searchPublicListings,
} from "@/modules/listings/service";
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

  const query = parseListingQuery(searchParams, category);
  const [{ items, total, page, totalPages }, makes] = await Promise.all([
    searchPublicListings(query),
    getMakesForCategory(category),
  ]);
  const flat = flatten(searchParams);
  const basePath = `/${category}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{tc(category)}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {tc(`${category}Description`)}
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-lg border bg-card p-4">
            <h2 className="mb-4 font-semibold">{tr("filtersTitle")}</h2>
            <FilterForm category={category} makes={makes} values={query} />
          </div>
        </aside>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <MobileFilterDrawer
              category={category}
              makes={makes}
              values={query}
            />
            <p className="text-sm text-muted-foreground">
              {tr("count", { count: total })}
            </p>
            <SortSelect value={query.sort} currentParams={flat} />
          </div>

          {items.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title={tr("noResultsTitle")}
                body={tr("noResultsBody")}
                actionLabel={tr("clearFilters")}
                actionHref={`/${category}`}
              />
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((listing) => (
                <ListingCard key={listing.slug} listing={listing} />
              ))}
            </div>
          )}

          <PaginationControls
            page={page}
            totalPages={totalPages}
            hrefForPage={(p) =>
              `${basePath}${buildQueryString(flat, { page: p })}`
            }
          />
        </div>
      </div>
    </div>
  );
}
