"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type MobileNavProps = {
  links: readonly { href: string; label: string }[];
  brandLabel: string;
};

export function MobileNav({ links, brandLabel }: MobileNavProps) {
  const [open, setOpen] = useState(false);

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
          <SheetTitle className="text-start text-primary">{brandLabel}</SheetTitle>
        </SheetHeader>
        <nav aria-label="Mobile" className="mt-4 flex flex-col gap-1 px-4">
          {links.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              className="justify-start"
              onClick={() => setOpen(false)}
              render={<Link href={link.href} />}
            >
              {link.label}
            </Button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
