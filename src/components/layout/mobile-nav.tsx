"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Car,
  ChevronRight,
  CircleGauge,
  Hash,
  HelpCircle,
  Info,
  LayoutList,
  LogIn,
  LogOut,
  Mail,
  Menu,
  Ship,
  UserPlus,
} from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/layout/brand-mark";
import { CountrySwitcher } from "@/components/layout/country-switcher";
import type { GccCode } from "@/lib/gcc";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type MobileNavAccount =
  | {
      signedIn: true;
      name: string;
      href: string;
      labels: { account: string; myListings: string; signOut: string };
    }
  | {
      signedIn: false;
      labels: { account: string; login: string; register: string };
    };

type MobileNavProps = {
  links: readonly { href: string; label: string }[];
  brandLabel: string;
  account: MobileNavAccount;
  /** Countries that are switched on, and the one being browsed (undefined = whole GCC). */
  countries?: GccCode[];
  selectedCountry?: GccCode;
};

const LINK_ICONS: Record<string, typeof Car> = {
  "/cars": Car,
  "/motorcycles": CircleGauge,
  "/boats": Ship,
  "/plates": Hash,
};

export function MobileNav({
  links,
  brandLabel,
  account,
  countries = [],
  selectedCountry,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const tn = useTranslations("nav");
  const tc = useTranslations("common");
  const tCountry = useTranslations("country");

  const close = () => setOpen(false);

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      close();
      router.push("/");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  const secondary = [
    { href: "/about", label: tn("about"), icon: Info },
    { href: "/faq", label: tn("faq"), icon: HelpCircle },
    { href: "/contact", label: tn("contact"), icon: Mail },
  ];

  const rowClass =
    "group flex min-h-12 items-center gap-3 rounded-2xl px-3 text-[0.95rem] font-medium transition-colors active:scale-[0.98] active:bg-muted";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-10 rounded-full md:hidden"
            aria-label="Menu"
          />
        }
      >
        <Menu className="size-5" aria-hidden />
      </SheetTrigger>
      <SheetContent
        side={locale === "ar" ? "right" : "left"}
        className="w-[86%] max-w-sm gap-0 overflow-y-auto p-0 [&>[data-slot=sheet-close]]:text-white [&>[data-slot=sheet-close]]:hover:bg-white/10"
      >
        <SheetHeader className="relative overflow-hidden bg-ink p-5 pb-6 text-ink-foreground">
          <div
            aria-hidden
            className="absolute -end-10 -top-16 size-48 rounded-full bg-accent/25 blur-3xl"
          />
          <SheetTitle className="relative flex items-center gap-2.5 text-start text-white">
            <BrandMark />
            <span className="flex flex-col leading-tight">
              <span className="font-heading text-lg font-extrabold">
                {brandLabel}
              </span>
              <span className="text-[0.7rem] font-normal tracking-wide text-white/55 uppercase">
                {tc("tagline")}
              </span>
            </span>
          </SheetTitle>
          {account.signedIn && (
            <Link
              href={account.href}
              onClick={close}
              className="relative mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition-colors active:bg-white/10"
            >
              <span className="grid size-10 place-items-center rounded-full bg-accent font-heading font-bold text-accent-foreground">
                {account.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">
                  {account.name}
                </span>
                <span className="block text-xs text-white/55">
                  {account.labels.account}
                </span>
              </span>
              <ChevronRight
                className="size-4 text-white/50 rtl:rotate-180"
                aria-hidden
              />
            </Link>
          )}
        </SheetHeader>

        <nav aria-label="Mobile" className="flex flex-col gap-1 p-3">
          {links.map((link, i) => {
            const Icon = LINK_ICONS[link.href] ?? Car;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                aria-current={active ? "page" : undefined}
                className={cn(
                  rowClass,
                  "animate-fade-up",
                  active ? "bg-accent/10 text-foreground" : "hover:bg-muted",
                )}
                style={{ animationDelay: `${60 + i * 50}ms` }}
              >
                <span
                  className={cn(
                    "grid size-10 place-items-center rounded-xl transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "bg-primary/[0.07] text-primary",
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="flex-1">{link.label}</span>
                <ChevronRight
                  className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:rotate-180"
                  aria-hidden
                />
              </Link>
            );
          })}
        </nav>

        {countries.length > 1 && (
          <section
            aria-label={tCountry("label")}
            className="mx-3 mb-2 border-t pt-3"
          >
            <p className="px-3 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {tCountry("label")}
            </p>
            <CountrySwitcher
              variant="list"
              countries={countries}
              selected={selectedCountry}
              onChosen={close}
            />
          </section>
        )}

        <section
          aria-label={account.labels.account}
          className="mx-3 flex flex-col gap-1 border-t pt-3"
        >
          {account.signedIn ? (
            <>
              <Link
                href="/dashboard/listings"
                onClick={close}
                className={cn(rowClass, "hover:bg-muted")}
              >
                <LayoutList
                  className="size-5 text-muted-foreground"
                  aria-hidden
                />
                {account.labels.myListings}
              </Link>
              <button
                type="button"
                disabled={signingOut}
                onClick={signOut}
                className={cn(
                  rowClass,
                  "text-destructive hover:bg-destructive/10",
                )}
              >
                <LogOut className="size-5" aria-hidden />
                {account.labels.signOut}
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 py-1">
              <Button
                variant="outline"
                className="h-11 rounded-xl"
                onClick={close}
                render={<Link href="/auth/login" />}
              >
                <LogIn className="size-4" aria-hidden />
                {account.labels.login}
              </Button>
              <Button
                className="h-11 rounded-xl"
                onClick={close}
                render={<Link href="/auth/register" />}
              >
                <UserPlus className="size-4" aria-hidden />
                {account.labels.register}
              </Button>
            </div>
          )}
        </section>

        <nav
          aria-label={tn("about")}
          className="mx-3 mt-2 mb-6 flex flex-col border-t pt-3"
        >
          {secondary.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={close}
              className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
