"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
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
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">{t("errorTitle")}</h1>
      <p className="mt-2 text-muted-foreground">{t("errorBody")}</p>
      <Button onClick={reset} className="mt-8">
        {tc("retry")}
      </Button>
    </div>
  );
}
