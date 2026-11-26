import { Skeleton } from "@/components/ui/skeleton";

/**
 * Route-level loading placeholders. Each mirrors the real page layout so the
 * content does not jump when it arrives. Used by the loading.tsx files.
 */

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Skeleton className="aspect-[16/10] rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function ResultsSkeleton() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-live="polite"
    >
      <Skeleton className="h-9 w-40" />
      <Skeleton className="mt-2 h-5 w-96 max-w-full" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <Skeleton className="hidden h-[480px] rounded-lg lg:block" />
        <div>
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-9 w-28 lg:hidden" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-52" />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ListingDetailSkeleton() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <Skeleton className="aspect-[16/10] rounded-xl" />
          <div className="mt-2 grid grid-cols-6 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-video" />
            ))}
          </div>
          <Skeleton className="mt-6 h-9 w-48" />
          <Skeleton className="mt-3 h-7 w-3/4" />
          <Skeleton className="mt-3 h-4 w-1/2" />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-5" />
            ))}
          </div>
        </div>
        <Skeleton className="hidden h-64 rounded-xl lg:block" />
      </div>
    </div>
  );
}

export function PanelSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <Skeleton className="h-8 w-56" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div
      className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-live="polite"
    >
      <Skeleton className="h-9 w-64 max-w-full" />
      <div className="mt-8 space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className={i % 3 === 2 ? "h-4 w-2/3" : "h-4"} />
        ))}
      </div>
    </div>
  );
}
