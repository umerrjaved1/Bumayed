"use client";

import type { ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Header link with an animated underline and an active-page indicator. */
export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
        "after:absolute after:inset-x-3.5 after:bottom-1 after:h-[2px] after:origin-center after:scale-x-0 after:rounded-full after:bg-accent after:transition-transform after:duration-300 after:ease-[var(--ease-out-expo)]",
        "hover:text-foreground hover:after:scale-x-100",
        active
          ? "text-foreground after:scale-x-100"
          : "text-muted-foreground",
      )}
    >
      {children}
    </Link>
  );
}
