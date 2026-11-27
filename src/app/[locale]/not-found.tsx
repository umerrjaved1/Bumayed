import { useTranslations } from "next-intl";
import { ArrowRight, Car, CircleGauge, Hash, Home, Ship } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/shared/search-bar";

/**
 * 404 that never strands the visitor: search right here, jump to a
 * category, or go home.
 */
export default function NotFound() {
  const t = useTranslations("errors");
  const tn = useTranslations("nav");

  const categories = [
    { href: "/cars", label: tn("cars"), icon: Car },
    { href: "/motorcycles", label: tn("motorcycles"), icon: CircleGauge },
    { href: "/boats", label: tn("boats"), icon: Ship },
    { href: "/plates", label: tn("plates"), icon: Hash },
  ];

  return (
    <div className="relative isolate overflow-hidden bg-ink text-ink-foreground">
      <div className="bg-grid mask-fade-b absolute inset-0 -z-10 opacity-50" />
      <div
        aria-hidden
        className="animate-float absolute -top-24 end-[-10%] -z-10 size-96 rounded-full bg-accent/20 blur-[110px]"
      />
      <div className="mx-auto max-w-3xl px-4 pt-14 pb-20 text-center sm:pt-20">
        <p className="animate-fade-up text-gradient-gold font-heading text-7xl font-extrabold sm:text-8xl">
          404
        </p>
        <h1
          className="animate-fade-up mt-3 font-heading text-2xl font-bold sm:text-4xl"
          style={{ animationDelay: "80ms" }}
        >
          {t("notFoundTitle")}
        </h1>
        <p
          className="animate-fade-up mx-auto mt-3 max-w-md text-white/65"
          style={{ animationDelay: "140ms" }}
        >
          {t("notFoundHint")}
        </p>

        <div
          className="animate-fade-up mt-8 text-start"
          style={{ animationDelay: "200ms" }}
        >
          <SearchBar />
        </div>

        <ul
          className="animate-fade-up mt-6 grid grid-cols-3 gap-2 sm:gap-3"
          style={{ animationDelay: "260ms" }}
        >
          {categories.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-2 py-4 text-sm font-semibold transition-all hover:border-accent/60 hover:bg-white/10 active:scale-95"
              >
                <Icon
                  className="size-6 text-accent transition-transform duration-300 group-hover:scale-110"
                  aria-hidden
                />
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <Button
          variant="ghost"
          className="mt-6 h-11 rounded-full px-5 text-white hover:bg-white/10 hover:text-white"
          render={<Link href="/" />}
        >
          <Home className="size-4" aria-hidden />
          {t("backHome")}
          <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
