import { cn } from "@/lib/utils";

/** Bumayed monogram: a gold "B" road-curve on a midnight tile. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative grid size-9 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-primary to-ink text-accent shadow-[0_6px_16px_-6px_var(--primary)] transition-transform duration-500 ease-[var(--ease-spring)] group-hover:-rotate-6 group-hover:scale-105",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <path
          d="M7 4h6.2a4 4 0 0 1 1.6 7.67A4.3 4.3 0 0 1 13.6 20H7z"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M7 12h6.5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent" />
    </span>
  );
}
