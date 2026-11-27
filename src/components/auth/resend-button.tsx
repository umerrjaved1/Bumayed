"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, Loader2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const COOLDOWN_SECONDS = 60;

/**
 * "Resend email" with a countdown, so people can ask again without being able
 * to spam. Reports exactly what happened: sent, wait, or email unavailable.
 */
export function ResendButton({
  identifier,
  startCooldown = false,
  variant = "outline",
  label,
}: {
  /** Email or mobile number of the account. */
  identifier: string;
  /** True right after a link was just sent, so the button starts counting down. */
  startCooldown?: boolean;
  variant?: "outline" | "accent";
  label?: string;
}) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [seconds, setSeconds] = useState(startCooldown ? COOLDOWN_SECONDS : 0);
  const [state, setState] = useState<
    "idle" | "sending" | "sent" | "limited" | "unavailable" | "error"
  >("idle");

  useEffect(() => {
    if (seconds <= 0) return;
    const id = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [seconds]);

  async function resend() {
    setState("sending");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, locale }),
      });
      if (res.ok) {
        setState("sent");
        setSeconds(COOLDOWN_SECONDS);
      } else if (res.status === 429) {
        setState("limited");
        setSeconds(COOLDOWN_SECONDS);
      } else if (res.status === 503) {
        setState("unavailable");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  const waiting = seconds > 0;
  const message =
    state === "sent"
      ? t("resentOk")
      : state === "limited"
        ? t("resendRateLimited")
        : state === "unavailable"
          ? t("resendUnavailable")
          : state === "error"
            ? t("errors.generic")
            : null;

  return (
    <div>
      <Button
        type="button"
        variant={variant}
        onClick={resend}
        disabled={state === "sending" || waiting || !identifier}
        className="h-11 w-full rounded-xl font-semibold"
      >
        {state === "sending" ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <RotateCw className="size-4" aria-hidden />
        )}
        {waiting ? t("resendIn", { seconds }) : (label ?? t("resendEmail"))}
      </Button>
      {message && (
        <p
          role="status"
          className={
            state === "sent"
              ? "mt-2 flex items-center gap-1.5 text-sm font-medium text-success"
              : "mt-2 text-sm text-destructive"
          }
        >
          {state === "sent" && <CheckCircle2 className="size-4" aria-hidden />}
          {message}
        </p>
      )}
    </div>
  );
}
