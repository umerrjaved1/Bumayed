import { getTranslations } from "next-intl/server";
import { ArrowUpRight, Languages, ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { selectedCountry } from "@/lib/country";
import { BrandMark } from "@/components/layout/brand-mark";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const tb = await getTranslations("common");
  const tc = await getTranslations("categories");
  const th = await getTranslations("home");
  const country = await selectedCountry();
  // Number plates are issued per UAE emirate, so only the UAE (or all of the GCC) lists them.
  const showPlates = country === undefined || country === "AE";

  const columns = [
    {
      title: t("categories"),
      links: [
        { href: "/cars", label: tc("cars") },
        { href: "/motorcycles", label: tc("motorcycles") },
        { href: "/boats", label: tc("boats") },
        ...(showPlates ? [{ href: "/plates", label: tc("plates") }] : []),
      ],
    },
    {
      title: t("quickLinks"),
      links: [
        { href: "/about", label: tn("about") },
        { href: "/faq", label: tn("faq") },
        { href: "/contact", label: tn("contact") },
      ],
    },
    {
      title: t("legal"),
      links: [
        { href: "/terms", label: tn("terms") },
        { href: "/privacy", label: tn("privacy") },
      ],
    },
  ] as const;

  return (
    <footer className="relative isolate overflow-hidden bg-ink pb-24 text-ink-foreground md:pb-0">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent"
      />
      <div
        aria-hidden
        className="absolute start-1/2 -top-40 -z-10 size-[520px] -translate-x-1/2 rounded-full bg-primary/50 blur-[140px]"
      />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Link href="/" className="group inline-flex items-center gap-2.5">
            <BrandMark />
            <span className="font-heading text-xl font-extrabold tracking-tight">
              {tb("brand")}
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            {t("aboutBlurb")}
          </p>
          <ul className="mt-6 flex flex-wrap gap-2 text-xs text-white/70">
            <li className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <ShieldCheck className="size-3.5 text-accent" aria-hidden />
              {th("trustModerated")}
            </li>
            <li className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <Languages className="size-3.5 text-accent" aria-hidden />
              {th("trustBilingual")}
            </li>
          </ul>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="text-xs font-semibold tracking-[0.14em] text-white/45 uppercase">
              {col.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-sm text-white/75 transition-colors hover:text-accent"
                  >
                    {link.label}
                    <ArrowUpRight
                      className="size-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 rtl:-scale-x-100"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-white/45 sm:flex-row sm:px-6 lg:px-8">
          <span>{t("copyright", { year: new Date().getFullYear() })}</span>
          <span>{tb("tagline")}</span>
        </div>
      </div>
      <p
        aria-hidden
        className="pointer-events-none -mb-[0.22em] text-center font-heading text-[22vw] leading-none font-extrabold tracking-tighter text-white/[0.03] select-none"
      >
        {tb("brand")}
      </p>
    </footer>
  );
}
