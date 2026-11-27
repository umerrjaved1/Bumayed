import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type CategoryCardProps = {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  image?: string;
  /** Shown instead of a photo, e.g. a sample number plate. */
  visual?: React.ReactNode;
  countLabel?: string;
  ctaLabel?: string;
  className?: string;
};

/** Photo-led category tile: the image zooms, copy lifts and the arrow slides on hover. */
export function CategoryCard({
  href,
  icon: Icon,
  title,
  description,
  image,
  visual,
  countLabel,
  ctaLabel,
  className,
}: CategoryCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative isolate flex min-h-72 flex-col justify-end overflow-hidden rounded-3xl bg-ink p-6 text-white ring-1 ring-foreground/10 transition-shadow duration-500 hover:shadow-[0_30px_60px_-25px_oklch(0.2_0.05_258/0.55)] sm:p-7",
        className,
      )}
    >
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="-z-10 object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary to-ink" />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/55 to-ink/5" />
      {visual && (
        <div
          aria-hidden
          className="absolute inset-x-0 top-[28%] -z-[5] flex justify-center transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105 lg:top-[22%] lg:justify-end lg:pe-16"
        >
          {visual}
        </div>
      )}

      <div className="absolute start-6 top-6 flex items-center gap-2 sm:start-7 sm:top-7">
        <span className="glass-dark grid size-11 place-items-center rounded-2xl text-accent transition-all duration-500 ease-[var(--ease-spring)] group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-accent group-hover:text-accent-foreground">
          <Icon className="size-5" aria-hidden />
        </span>
        {countLabel && (
          <span className="glass-dark rounded-full px-3 py-1 text-xs font-medium">
            {countLabel}
          </span>
        )}
      </div>

      <div className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-1">
        <h3 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h3>
        <p className="mt-2 max-w-sm text-sm text-white/75">{description}</p>
        {ctaLabel && (
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent">
            {ctaLabel}
            <span className="grid size-7 place-items-center rounded-full bg-accent/15 transition-all duration-500 ease-[var(--ease-spring)] group-hover:translate-x-1 group-hover:bg-accent group-hover:text-accent-foreground rtl:group-hover:-translate-x-1">
              <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden />
            </span>
          </span>
        )}
      </div>
    </Link>
  );
}
