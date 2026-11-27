"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Info, Loader2, TriangleAlert } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordField } from "@/components/auth/password-field";
import { savePending } from "@/components/auth/pending-store";
import {
  GCC_COUNTRIES,
  hasCountryCode,
  looksLikePhone,
  normalizePhoneInput,
} from "@/modules/auth/phone";

/**
 * Only same-site paths are allowed, so the login page cannot redirect elsewhere.
 * The locale prefix is removed because the i18n router adds the current one.
 */
function safeCallbackPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) {
    return "/dashboard";
  }
  const stripped = raw.replace(/^\/(en|ar)(?=\/|$)/, "");
  return stripped || "/";
}

export function LoginForm({
  justRegistered = false,
  defaultDial = "971",
}: {
  justRegistered?: boolean;
  /** Country code pre-selected from where the visitor is (for example "966"). */
  defaultDial?: string;
}) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [dial, setDial] = useState(defaultDial);
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<{ message: string; code?: string } | null>(
    null,
  );
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setPending(true);
    // "050 123 4567" works as well as "+971501234567".
    const id = identifier.trim();
    const who = looksLikePhone(id) ? normalizePhoneInput(id, dial) : id;
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: who, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.error?.code === "EMAIL_NOT_VERIFIED") {
          // Don't leave them on a dead-end error: take them to the screen that
          // explains the next step and lets them ask for a new link.
          savePending({ identifier: who, email: who.includes("@") ? who : undefined });
          router.push("/auth/verify-pending?mode=login_blocked");
          return;
        }
        setError({
          message: data?.error?.message ?? t("errors.generic"),
          code: data?.error?.code,
        });
        setPending(false);
        return;
      }
      // Read at submit time; useSearchParams would stop this page from prerendering.
      const callbackUrl = new URLSearchParams(window.location.search).get(
        "callbackUrl",
      );
      router.push(safeCallbackPath(callbackUrl));
      router.refresh();
    } catch {
      setError({ message: t("errors.generic") });
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {justRegistered && !error && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-xl border border-accent/40 bg-accent/10 p-3 text-sm"
        >
          <Info className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
          <span>
            {t("registeredPleaseSignIn")} {t("existingAccountHint")}
          </span>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="identifier">{t("identifier")}</Label>
        <Input
          id="identifier"
          name="identifier"
          autoComplete="username"
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder={t("identifierPlaceholder")}
          dir="ltr"
          className="text-start"
        />
      </div>
      {/* A number typed without a country code needs to know which country */}
      {looksLikePhone(identifier) && !hasCountryCode(identifier) && (
        <div className="-mt-2 flex items-center gap-2 text-sm animate-in fade-in slide-in-from-top-1 duration-300">
          <label htmlFor="login-country" className="text-muted-foreground">
            {t("loginCountryHint")}
          </label>
          <select
            id="login-country"
            value={dial}
            onChange={(e) => setDial(e.target.value)}
            className="h-10 rounded-xl border border-input bg-transparent px-2 text-sm font-medium outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {GCC_COUNTRIES.map((c) => (
              <option key={c.code} value={c.dial}>
                {locale === "ar" ? c.nameAr : c.shortEn} +{c.dial}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="password">{t("password")}</Label>
          <Link
            href="/auth/forgot-password"
            className="inline-flex min-h-8 items-center text-xs text-muted-foreground hover:text-primary"
          >
            {t("forgotLink")}
          </Link>
        </div>
        <PasswordField
          id="password"
          name="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
      </div>

      {error && (
        <div
          role="alert"
          className="space-y-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <p className="flex items-start gap-2">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {error.message}
          </p>
          {error.code === "INVALID_CREDENTIALS" && (
            <Link
              href="/auth/forgot-password"
              className="inline-flex min-h-8 items-center font-semibold underline"
            >
              {t("forgotInline")}
            </Link>
          )}
        </div>
      )}

      <Button
        type="submit"
        variant="accent"
        className="h-12 w-full rounded-xl text-base font-semibold"
        disabled={pending}
      >
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {pending ? t("signingIn") : t("signIn")}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {t("noAccount")}{" "}
        <Link href="/auth/register" className="font-semibold text-primary">
          {t("registerLink")}
        </Link>
      </p>
    </form>
  );
}
