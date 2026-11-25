import type { LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type CategoryCardProps = {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
};

export function CategoryCard({ href, icon: Icon, title, description }: CategoryCardProps) {
  return (
    <Link href={href} className="group block">
      <Card className="h-full transition-shadow group-hover:shadow-md">
        <CardHeader>
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
            <Icon className="size-6" aria-hidden />
          </div>
          <CardTitle className="pt-2">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
