import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const tb = await getTranslations("common");
  const tc = await getTranslations("categories");

  const columns = [
    {
      title: t("categories"),
      links: [
        { href: "/cars", label: tc("cars") },
        { href: "/motorcycles", label: tc("motorcycles") },
        { href: "/boats", label: tc("boats") },
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
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="text-lg font-bold">{tb("brand")}</p>
          <p className="mt-2 max-w-xs text-sm text-primary-foreground/75">
            {t("aboutBlurb")}
          </p>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-foreground/60">
              {col.title}
            </h3>
            <ul className="mt-3 space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/85 transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-primary-foreground/15 py-4 text-center text-xs text-primary-foreground/60">
        {t("copyright", { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}
