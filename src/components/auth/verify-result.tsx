"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, MailX } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResendButton } from "@/components/auth/resend-button";
import { clearPending } from "@/components/auth/pending-store";
import { Button } from "@/components/ui/button";

const REDIRECT_SECONDS = 4;

/** Result of tapping the link in the verification email. */
export function VerifyResult({
  ok,
  email,
  signedIn,
  message,
}: {
  ok: boolean;
  email: string | null;
  signedIn: boolean;
  /** Reason shown when the link failed (already worded by the server). */
  message: string;
}) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [seconds, setSeconds] = useState(REDIRECT_SECONDS);
  const next = signedIn ? "/dashboard" : "/auth/login";

  useEffect(() => {
    if (ok) clearPending();
  }, [ok]);

  useEffect(() => {
    if (!ok) return;
    if (seconds <= 0) {
      router.replace(next);
      return;
    }
    const id = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [ok, seconds, router, next]);

  if (ok) {
    return (
      <AuthShell
        title={t("verifyDoneTitle")}
        icon={
          <span className="grid size-14 place-items-center rounded-2xl bg-success/15 text-success">
            <CheckCircle2 className="size-8 animate-in zoom-in-50 duration-500" aria-hidden />
          </span>
        }
      >
        <p role="status" className="text-sm text-muted-foreground">
          {t("verifySuccess")} {t("verifyDoneBody", { seconds })}
        </p>
        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-foreground/10" aria-hidden>
          <div
            className="h-full rounded-full bg-success transition-all duration-1000 ease-linear"
            style={{ width: `${((REDIRECT_SECONDS - seconds) / REDIRECT_SECONDS) * 100}%` }}
          />
        </div>
        <Button
          variant="accent"
          className="mt-6 h-12 w-full rounded-xl text-base font-semibold"
          render={<Link href={next} />}
        >
          {signedIn ? t("goDashboard") : t("continueNow")}
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={t("verifyFailedTitle")}
      icon={
        <span className="grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <MailX className="size-7" aria-hidden />
        </span>
      }
    >
      <div className="space-y-5">
        <p role="alert" className="text-sm text-muted-foreground">
          {t("verifyFailedBody")}
          {message ? ` (${message})` : ""}
        </p>
        {email ? (
          <ResendButton
            identifier={email}
            variant="accent"
            label={t("sendNewLink")}
          />
        ) : (
          <Button
            variant="accent"
            className="h-12 w-full rounded-xl font-semibold"
            render={<Link href="/auth/login" />}
          >
            {t("backToLogin")}
          </Button>
        )}
        <p className="text-center text-sm">
          <Link href="/auth/login" className="font-semibold text-primary">
            {t("backToLogin")}
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
