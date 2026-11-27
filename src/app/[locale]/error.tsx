"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Home, Mail, RotateCcw, TriangleAlert } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");
  const tc = useTranslations("common");

  useEffect(() => {
    // Hook for Sentry (added pre-production, playbook §3)
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-destructive/10 text-destructive">
        <TriangleAlert className="size-7" aria-hidden />
      </span>
      <h1 className="mt-5 font-heading text-2xl font-bold sm:text-3xl">
        {t("errorTitle")}
      </h1>
      <p className="mt-2 text-muted-foreground">{t("errorBody")}</p>
      <div className="mt-8 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <Button
          onClick={reset}
          variant="accent"
          className="h-11 rounded-xl px-6 font-semibold"
        >
          <RotateCcw className="size-4" aria-hidden />
          {tc("retry")}
        </Button>
        <Button
          variant="outline"
          className="h-11 rounded-xl px-6"
          render={<Link href="/" />}
        >
          <Home className="size-4" aria-hidden />
          {t("goHome")}
        </Button>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        {t("errorHint")}{" "}
        <Link
          href="/contact"
          className="inline-flex items-center gap-1 font-semibold text-primary underline-offset-4 hover:underline"
        >
          <Mail className="size-3.5" aria-hidden />
          {t("contactUs")}
        </Link>
      </p>
    </div>
  );
}
