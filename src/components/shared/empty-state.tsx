import type { LucideIcon } from "lucide-react";
import { SearchX } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

/**
 * Friendly "nothing here" panel that always offers a way forward: a primary
 * next step, an optional secondary one, and room for suggestions.
 */
export function EmptyState({
  title,
  body,
  actionLabel,
  actionHref,
  secondaryLabel,
  secondaryHref,
  icon: Icon = SearchX,
  children,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative isolate flex flex-col items-center overflow-hidden rounded-3xl border border-dashed bg-card px-6 py-14 text-center">
      <div className="bg-dots mask-fade-b absolute inset-0 -z-10 opacity-60" />
      <span className="relative grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-ink text-accent shadow-lg">
        <span
          aria-hidden
          className="animate-pulse-ring absolute inset-0 rounded-2xl bg-accent/30"
        />
        <Icon className="relative size-7" aria-hidden />
      </span>
      <h2 className="mt-5 font-heading text-xl font-bold">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{body}</p>
      {children}
      {((actionLabel && actionHref) || (secondaryLabel && secondaryHref)) && (
        <div className="mt-7 flex w-full flex-col justify-center gap-2 sm:w-auto sm:flex-row">
          {actionLabel && actionHref && (
            <Button
              variant="accent"
              className="h-11 rounded-xl px-6 font-semibold"
              render={<Link href={actionHref} />}
            >
              {actionLabel}
            </Button>
          )}
          {secondaryLabel && secondaryHref && (
            <Button
              variant="outline"
              className="h-11 rounded-xl px-6"
              render={<Link href={secondaryHref} />}
            >
              {secondaryLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
