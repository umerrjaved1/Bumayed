import { BrandMark } from "@/components/layout/brand-mark";

export function AuthShell({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  /** Replaces the logo at the top of the card (for example a mail icon). */
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate overflow-hidden">
      {/* Soft brand backdrop */}
      <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-ink sm:h-80">
        <div className="bg-grid mask-fade-b absolute inset-0 opacity-60" />
        <div
          aria-hidden
          className="animate-float absolute -top-24 end-[-10%] size-80 rounded-full bg-accent/25 blur-[100px]"
        />
      </div>

      <div className="mx-auto flex min-h-[75vh] max-w-md flex-col px-4 pt-10 pb-16 sm:justify-center sm:pt-16">
        <div className="animate-fade-up rounded-3xl border bg-card p-6 shadow-[0_30px_80px_-40px_oklch(0.2_0.05_258/0.5)] sm:p-8">
          {icon ?? (
            <span className="group inline-flex">
              <BrandMark className="size-11" />
            </span>
          )}
          <h1 className="mt-5 font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          )}
          <div className="mt-7 [&_[data-slot=button][type=submit]]:h-11 [&_[data-slot=button][type=submit]]:rounded-xl [&_[data-slot=button][type=submit]]:text-[0.95rem] [&_[data-slot=input]]:h-11 [&_[data-slot=input]]:rounded-xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
