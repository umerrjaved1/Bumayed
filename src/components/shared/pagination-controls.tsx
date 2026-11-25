import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  /** Base path with current filters serialized, e.g. `/cars?make=Nissan` */
  hrefForPage: (page: number) => string;
};

/** Server-rendered pagination — plain links so pages are bookmarkable (§6.2). */
export function PaginationControls({
  page,
  totalPages,
  hrefForPage,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  // Compact window: current ±2, always first/last
  const pages = new Set<number>([1, totalPages]);
  for (let p = page - 2; p <= page + 2; p++) {
    if (p >= 1 && p <= totalPages) pages.add(p);
  }
  const sorted = [...pages].sort((a, b) => a - b);

  return (
    <Pagination className="mt-8">
      <PaginationContent>
        {page > 1 && (
          <PaginationItem>
            <PaginationPrevious href={hrefForPage(page - 1)} />
          </PaginationItem>
        )}
        {sorted.map((p, i) => (
          <span key={p} className="contents">
            {i > 0 && sorted[i - 1] < p - 1 && (
              <PaginationItem>
                <span className="px-2 text-muted-foreground">…</span>
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink href={hrefForPage(p)} isActive={p === page}>
                {p}
              </PaginationLink>
            </PaginationItem>
          </span>
        ))}
        {page < totalPages && (
          <PaginationItem>
            <PaginationNext href={hrefForPage(page + 1)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}
