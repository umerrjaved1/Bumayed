import { getTranslations } from "next-intl/server";
import { Plus, UserRound } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { HeaderShell } from "@/components/layout/header-shell";
import { NavLink } from "@/components/layout/nav-link";
import { BrandMark } from "@/components/layout/brand-mark";
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
    <HeaderShell>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <MobileNav
          links={links}
          brandLabel={t("brand")}
          account={mobileAccount}
        />

        <Link
          href="/"
          className="group flex items-center gap-2.5"
          aria-label={t("brand")}
        >
          <BrandMark />
          <span className="flex flex-col leading-none">
            <span className="font-heading text-lg font-extrabold tracking-tight text-foreground">
              {t("brand")}
            </span>
            <span className="hidden text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase sm:block">
              {t("tagline")}
            </span>
          </span>
        </Link>

        <nav
          aria-label="Main"
          className="ms-6 hidden items-center gap-0.5 md:flex"
        >
          {links.map((link) => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            className="hidden h-9 rounded-full px-3.5 sm:inline-flex"
            render={
              <Link href={session?.user ? accountHref : "/auth/login"} />
            }
          >
            <UserRound className="size-4" aria-hidden />
            {session?.user ? (session.user.name ?? t("login")) : t("login")}
          </Button>
          <Button
            variant="accent"
            className="hidden h-9 rounded-full px-4 font-semibold md:inline-flex"
            render={
              <Link
                href={
                  session?.user ? "/dashboard/listings/new" : "/auth/register"
                }
              />
            }
          >
            <Plus
              className="size-4 transition-transform duration-300 group-hover/button:rotate-90"
              aria-hidden
            />
            {t("postAd")}
          </Button>
        </div>
      </div>
    </HeaderShell>
  );
}
