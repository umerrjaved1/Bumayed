import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import {
  MobileNav,
  type MobileNavAccount,
} from "@/components/layout/mobile-nav";

export async function SiteHeader() {
  const t = await getTranslations("common");
  const tn = await getTranslations("nav");
  const td = await getTranslations("dashboard");
  const tauth = await getTranslations("auth");
  const session = await auth();

  const role = session?.user?.role;
  const accountHref =
    role === "SUPER_ADMIN" || role === "MODERATOR"
      ? "/admin"
      : role === "DEALER"
        ? "/dashboard/dealer"
        : "/dashboard";

  const mobileAccount: MobileNavAccount = session?.user
    ? {
        signedIn: true,
        name: session.user.name ?? td("account"),
        href: accountHref,
        labels: {
          account: td("account"),
          myListings: td("listings"),
          signOut: td("signOut"),
        },
      }
    : {
        signedIn: false,
        labels: {
          account: td("account"),
          login: t("login"),
          register: tauth("createAccount"),
        },
      };

  const links = [
    { href: "/cars", label: tn("cars") },
    { href: "/motorcycles", label: tn("motorcycles") },
    { href: "/boats", label: tn("boats") },
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <MobileNav
          links={links}
          brandLabel={t("brand")}
          account={mobileAccount}
        />

        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-xl font-bold tracking-tight text-primary">
            {t("brand")}
          </span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {t("tagline")}
          </span>
        </Link>

        <nav
          aria-label="Main"
          className="ms-6 hidden items-center gap-1 md:flex"
        >
          {links.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              render={<Link href={link.href} />}
            >
              {link.label}
            </Button>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <LanguageSwitcher />
          {session?.user ? (
            <Button
              variant="outline"
              className="hidden sm:inline-flex"
              render={<Link href={accountHref} />}
            >
              {session.user.name ?? t("login")}
            </Button>
          ) : (
            <Button
              variant="outline"
              className="hidden sm:inline-flex"
              render={<Link href="/auth/login" />}
            >
              {t("login")}
            </Button>
          )}
          <Button
            render={
              <Link
                href={
                  session?.user ? "/dashboard/listings/new" : "/auth/register"
                }
              />
            }
          >
            <Plus className="size-4" aria-hidden />
            {t("postAd")}
          </Button>
        </div>
      </div>
    </header>
  );
}
