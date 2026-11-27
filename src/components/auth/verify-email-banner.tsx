"use client";

import { useTranslations } from "next-intl";
import { MailWarning } from "lucide-react";
import { ResendButton } from "@/components/auth/resend-button";

/** Reminder on the dashboard for people whose email is not confirmed yet. */
export function VerifyEmailBanner({ email }: { email: string }) {
  const t = useTranslations("auth");
  return (
    <div
      role="status"
      className="mt-6 flex flex-col gap-4 rounded-2xl border border-accent/40 bg-accent/10 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <MailWarning className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
        <div className="text-sm">
          <p className="font-semibold">{t("bannerVerifyTitle")}</p>
          <p className="mt-0.5 text-muted-foreground">
            {t("bannerVerifyBody", { email })}
          </p>
        </div>
      </div>
      <div className="sm:w-60 sm:shrink-0">
        <ResendButton identifier={email} label={t("bannerSend")} />
      </div>
    </div>
  );
}
