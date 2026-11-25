"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
};

export function MobileNav({ links, brandLabel, account }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();

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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Menu"
          />
        }
      >
        <Menu className="size-5" aria-hidden />
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle className="text-start text-primary">
            {brandLabel}
          </SheetTitle>
        </SheetHeader>
        <nav aria-label="Mobile" className="mt-4 flex flex-col gap-1 px-4">
          {links.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              className="justify-start"
              onClick={close}
              render={<Link href={link.href} />}
            >
              {link.label}
            </Button>
          ))}
        </nav>

        <section
          aria-label={account.labels.account}
          className="mt-2 flex flex-col gap-1 border-t px-4 pt-4"
        >
          <p className="px-2.5 pb-1 text-xs font-medium text-muted-foreground uppercase">
            {account.labels.account}
          </p>
          {account.signedIn ? (
            <>
              <Button
                variant="ghost"
                className="justify-start font-semibold"
                onClick={close}
                render={<Link href={account.href} />}
              >
                {account.name}
              </Button>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={close}
                render={<Link href="/dashboard/listings" />}
              >
                {account.labels.myListings}
              </Button>
              <Button
                variant="ghost"
                className="justify-start text-destructive"
                disabled={signingOut}
                onClick={signOut}
              >
                {account.labels.signOut}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={close}
                render={<Link href="/auth/login" />}
              >
                {account.labels.login}
              </Button>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={close}
                render={<Link href="/auth/register" />}
              >
                {account.labels.register}
              </Button>
            </>
          )}
        </section>
      </SheetContent>
    </Sheet>
  );
}
