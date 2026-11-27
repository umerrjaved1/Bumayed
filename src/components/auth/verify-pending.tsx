"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  Compass,
  Inbox,
  Mail,
  MailWarning,
  Megaphone,
  PartyPopper,
  Smartphone,
  TriangleAlert,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResendButton } from "@/components/auth/resend-button";
import {
  inboxLink,
  maskEmail,
  readPending,
  type PendingVerification,
} from "@/components/auth/pending-store";
import { Button } from "@/components/ui/button";
import type { PendingMode } from "@/components/auth/pending-mode";

function IconBadge({
  children,
  tone = "gold",
}: {
  children: React.ReactNode;
  tone?: "gold" | "green" | "red";
}) {
  const tones = {
    gold: "bg-accent/15 text-accent",
    green: "bg-success/15 text-success",
    red: "bg-destructive/10 text-destructive",
  } as const;
  return (
    <span
      className={`relative grid size-14 place-items-center rounded-2xl ${tones[tone]}`}
    >
      <span
        aria-hidden
        className="animate-pulse-ring absolute inset-0 rounded-2xl bg-current opacity-20"
      />
      <span className="relative">{children}</span>
    </span>
  );
}

/** The alert people asked for: a clear, can't-miss box saying what to do next. */
function Callout({
  title,
  children,
  tone = "gold",
}: {
  title: string;
  children: React.ReactNode;
  tone?: "gold" | "green";
}) {
  return (
    <div
      role="alert"
      className={
        tone === "gold"
          ? "flex gap-3 rounded-2xl border border-accent/40 bg-accent/10 p-4"
          : "flex gap-3 rounded-2xl border border-success/40 bg-success/10 p-4"
      }
    >
      <TriangleAlert
        className={
          tone === "gold"
            ? "mt-0.5 size-5 shrink-0 text-accent"
            : "mt-0.5 size-5 shrink-0 text-success"
        }
        aria-hidden
      />
      <div className="text-sm">
        <p className="font-semibold">{title}</p>
        <p className="mt-1 leading-relaxed text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}

/**
 * Where people land after signing up (or after trying to sign in without a
 * verified email). Tells them exactly what to do next and always offers a
 * way forward, so nobody is left on a form wondering what happened.
 */
export function VerifyPending({
  mode,
  signedIn,
  accountEmail,
  accountPhone,
}: {
  mode: PendingMode;
  signedIn: boolean;
  accountEmail: string | null;
  accountPhone: string | null;
}) {
  const t = useTranslations("auth");
  const [stored, setStored] = useState<PendingVerification>({});

  useEffect(() => {
    // Browser storage only exists after mount; read it off the first paint.
    const id = window.setTimeout(() => setStored(readPending()), 0);
    return () => window.clearTimeout(id);
  }, []);

  const email = accountEmail ?? stored.email ?? undefined;
  const identifier = stored.email ?? stored.identifier ?? accountEmail ?? "";

  /* ---------- Account is active: welcome + clear next steps ---------- */
  if (mode === "email_unavailable" || mode === "phone_only") {
    const phone = accountPhone;
    return (
      <AuthShell
        title={t("welcomeTitle")}
        icon={
          <IconBadge tone="green">
            <PartyPopper className="size-7" aria-hidden />
          </IconBadge>
        }
      >
        <div className="space-y-5">
          <Callout title={t("accountCreated")} tone="green">
            {mode === "email_unavailable"
              ? t("welcomeEmailAlert")
              : phone
                ? t("welcomePhoneAlert", { phone })
                : t("welcomePhoneAlertNoNumber")}
          </Callout>
          <p className="text-sm text-muted-foreground">{t("welcomeBody")}</p>
          {signedIn ? (
            <div className="flex flex-col gap-2">
              <Button
                variant="accent"
                className="h-12 rounded-xl text-base font-semibold"
                render={<Link href="/dashboard/listings/new" />}
              >
                <Megaphone className="size-4" aria-hidden />
                {t("postFirstAd")}
              </Button>
              <Button
                variant="outline"
                className="h-11 rounded-xl"
                render={<Link href="/cars" />}
              >
                <Compass className="size-4" aria-hidden />
                {t("browseCars")}
              </Button>
              <Link
                href="/dashboard"
                className="mt-1 inline-flex min-h-10 items-center justify-center gap-1 text-sm font-medium text-primary"
              >
                {t("goDashboard")}
                <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
              </Link>
            </div>
          ) : (
            <Button
              className="h-12 w-full rounded-xl text-base font-semibold"
              render={<Link href="/auth/login" />}
            >
              {t("signIn")}
            </Button>
          )}
        </div>
      </AuthShell>
    );
  }

  /* ---------- Email link needed: check inbox / resend ---------- */
  const failed = mode === "email_failed";
  const blocked = mode === "login_blocked";
  const title = failed
    ? t("pendingFailedTitle")
    : blocked
      ? t("pendingLoginTitle")
      : t("pendingEmailTitle");

  return (
    <AuthShell
      title={title}
      icon={
        <IconBadge tone={failed ? "red" : "gold"}>
          {failed ? (
            <MailWarning className="size-7" aria-hidden />
          ) : (
            <Mail className="size-7" aria-hidden />
          )}
        </IconBadge>
      }
    >
      <div className="space-y-5">
        <Callout title={t("pendingAlertTitle")}>
          {failed
            ? t("pendingFailedBody")
            : blocked
              ? t("pendingLoginBody")
              : email
                ? t("pendingEmailBody", { email: maskEmail(email) })
                : t("pendingEmailBodyNoAddress")}
        </Callout>

        {!failed && (
          <ol className="space-y-3">
            {[t("pendingStep1"), t("pendingStep2"), t("pendingStep3")].map(
              (step, i) => (
                <li key={step} className="flex items-center gap-3 text-sm">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground tabular-nums">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ),
            )}
          </ol>
        )}

        <div className="flex flex-col gap-2">
          {!failed && (
            <Button
              variant="accent"
              className="h-12 rounded-xl text-base font-semibold"
              render={
                <a
                  href={inboxLink(email)}
                  target={inboxLink(email) === "mailto:" ? undefined : "_blank"}
                  rel="noopener noreferrer"
                />
              }
            >
              <Inbox className="size-4" aria-hidden />
              {t("openMail")}
            </Button>
          )}
          <ResendButton
            identifier={identifier}
            startCooldown={mode === "email_sent"}
            variant={failed ? "accent" : "outline"}
          />
        </div>

        {!failed && (
          <p className="text-center text-xs text-muted-foreground">
            {t("pendingSpamTip")}
          </p>
        )}

        <div className="flex flex-col items-center gap-1 border-t pt-4 text-sm">
          <Link
            href="/auth/login"
            className="inline-flex min-h-10 items-center font-semibold text-primary"
          >
            {t("alreadyVerified")}
          </Link>
          {!blocked && (
            <Link
              href="/auth/register"
              className="inline-flex min-h-10 items-center text-muted-foreground hover:text-foreground"
            >
              <Smartphone className="me-1.5 size-4" aria-hidden />
              {t("wrongEmail")}
            </Link>
          )}
        </div>
      </div>
    </AuthShell>
  );
}
