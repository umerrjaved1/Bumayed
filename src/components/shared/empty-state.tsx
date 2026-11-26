import { SearchX } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  body,
  actionLabel,
  actionHref,
  children,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed py-16 text-center">
      <SearchX className="size-10 text-muted-foreground" aria-hidden />
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
      {children}
      {actionLabel && actionHref && (
        <Button
          variant="outline"
          className="mt-6"
          render={<Link href={actionHref} />}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
