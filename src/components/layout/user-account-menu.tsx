"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { UserRound, LogOut, LayoutDashboard, PlusCircle, Shield, ChevronDown, Loader2 } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserAccountMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
  accountHref: string;
}

export function UserAccountMenu({ user, accountHref }: UserAccountMenuProps) {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const displayName = user.name || user.email?.split("@")[0] || t("account");
  const isAdmin = user.role === "SUPER_ADMIN" || user.role === "MODERATOR";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="hidden h-9 rounded-full px-3 gap-1.5 sm:inline-flex border border-border bg-card/60 hover:bg-muted"
          />
        }
      >
        <UserRound className="size-4 text-primary" aria-hidden />
        <span className="max-w-[130px] truncate text-xs font-bold font-heading">
          {displayName}
        </span>
        <ChevronDown className="size-3 text-muted-foreground opacity-70" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-2xl shadow-xl">
        <div className="px-3 py-2">
          <p className="text-xs font-bold text-foreground truncate">{displayName}</p>
          {user.email && (
            <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
          )}
          {user.role && (
            <span className="inline-block mt-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {user.role.replace("_", " ")}
            </span>
          )}
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          render={<Link href={accountHref} />}
          className="flex items-center gap-2 cursor-pointer py-2"
        >
          {isAdmin ? (
            <Shield className="size-4 text-primary" />
          ) : (
            <LayoutDashboard className="size-4 text-primary" />
          )}
          <span className="text-xs font-semibold">
            {isAdmin ? "Admin Panel" : t("overview")}
          </span>
        </DropdownMenuItem>

        {!isAdmin && (
          <DropdownMenuItem
            render={<Link href="/dashboard/listings" />}
            className="flex items-center gap-2 cursor-pointer py-2"
          >
            <PlusCircle className="size-4 text-muted-foreground" />
            <span className="text-xs font-semibold">{t("listings")}</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={loading}
          className="flex items-center gap-2 cursor-pointer py-2 text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LogOut className="size-4" />
          )}
          <span className="text-xs font-semibold">{t("signOut")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
