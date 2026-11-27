"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Compass, Heart, Home, Plus, UserRound } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type MobileTabBarProps = {
  signedIn: boolean;
  accountHref: string;
};

/** Pages that bring their own bottom bar or don't need the shopper tabs. */
const HIDDEN_PREFIXES = ["/listings/", "/admin", "/auth", "/checkout", "/dashboard/listings/new"];

/**
 * App-style bottom navigation for phones. It tucks away while you scroll
 * down to read and slides back as soon as you scroll up.
 */
export function MobileTabBar({ signedIn, accountHref }: MobileTabBarProps) {
  const t = useTranslations("tabBar");
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY.current;
        if (Math.abs(delta) > 6) {
          // Always show near the top and at the very bottom of the page.
          const atBottom =
            window.innerHeight + y >= document.documentElement.scrollHeight - 24;
          setHidden(delta > 0 && y > 120 && !atBottom);
          lastY.current = y;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  const isBrowse = ["/cars", "/motorcycles", "/boats", "/plates"].some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const favHref = signedIn
    ? "/dashboard/favorites"
    : `/auth/login?callbackUrl=${encodeURIComponent("/dashboard/favorites")}`;

  const tabs = [
    { href: "/", label: t("home"), icon: Home, active: pathname === "/" },
    { href: "/cars", label: t("browse"), icon: Compass, active: isBrowse },
    null, // centre action
    {
      href: favHref,
      label: t("saved"),
      icon: Heart,
      active: pathname.startsWith("/dashboard/favorites"),
    },
    {
      href: signedIn ? accountHref : "/auth/login",
      label: signedIn ? t("account") : t("login"),
      icon: UserRound,
      active:
        signedIn &&
        pathname.startsWith("/dashboard") &&
        !pathname.startsWith("/dashboard/favorites"),
    },
  ];

  return (
    <nav
      aria-label="Quick navigation"
      data-hidden={hidden || undefined}
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 transition-transform duration-500 ease-[var(--ease-out-expo)] data-[hidden]:translate-y-[calc(100%+1.5rem)] md:hidden"
    >
      <ul className="glass relative grid grid-cols-5 items-end rounded-[1.4rem] border border-foreground/[0.06] px-1.5 pt-1.5 pb-1.5 shadow-[0_18px_40px_-18px_oklch(0.2_0.05_258/0.45)]">
        {tabs.map((tab, i) =>
          tab === null ? (
            <li key="post" className="flex justify-center">
              <Link
                href={signedIn ? "/dashboard/listings/new" : "/auth/register"}
                className="group -mt-7 flex flex-col items-center gap-1 text-[0.68rem] font-semibold text-foreground"
              >
                <span className="relative grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-gold-soft via-accent to-[oklch(0.7_0.16_55)] text-accent-foreground shadow-[0_10px_24px_-8px_var(--accent)] ring-4 ring-background transition-transform duration-300 ease-[var(--ease-spring)] group-active:scale-90">
                  <Plus
                    className="size-6 transition-transform duration-500 ease-[var(--ease-spring)] group-hover:rotate-90"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                </span>
                {t("post")}
              </Link>
            </li>
          ) : (
            <li key={i}>
              <Link
                href={tab.href}
                aria-current={tab.active ? "page" : undefined}
                className={cn(
                  "group relative flex h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[0.68rem] font-medium transition-colors active:bg-muted",
                  tab.active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <tab.icon
                  className={cn(
                    "size-[1.35rem] transition-all duration-300 ease-[var(--ease-spring)] group-active:scale-90",
                    tab.active && "-translate-y-0.5 text-primary",
                  )}
                  strokeWidth={tab.active ? 2.4 : 1.9}
                  aria-hidden
                />
                {tab.label}
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-0.5 h-1 rounded-full bg-accent transition-all duration-500 ease-[var(--ease-spring)]",
                    tab.active ? "w-4 opacity-100" : "w-0 opacity-0",
                  )}
                />
              </Link>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}
