"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function RegisterForm({
  initialType = "individual",
}: {
  /** "dealer" when arriving from "Explore dealer packages" (?type=dealer). */
  initialType?: "individual" | "dealer";
}) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [accountType, setAccountType] = useState<"individual" | "dealer">(
    initialType,
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: String(fd.get("displayName") ?? ""),
          accountType,
          email: String(fd.get("email") ?? ""),
          phone: String(fd.get("phone") ?? ""),
          password: String(fd.get("password") ?? ""),
          businessName:
            accountType === "dealer"
              ? String(fd.get("businessName") ?? "")
              : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message ?? t("errors.generic"));
        return;
      }
      setSuccess(data.message ?? t("registerSuccess"));
      setTimeout(() => router.push("/auth/login"), 1500);
    } catch {
      setError(t("errors.generic"));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div
        role="group"
        aria-label={t("accountType")}
        className="grid grid-cols-2 gap-2"
      >
        <Button
          type="button"
          aria-pressed={accountType === "individual"}
          variant={accountType === "individual" ? "default" : "outline"}
          onClick={() => setAccountType("individual")}
        >
          {t("individual")}
        </Button>
        <Button
          type="button"
          aria-pressed={accountType === "dealer"}
          variant={accountType === "dealer" ? "default" : "outline"}
          onClick={() => setAccountType("dealer")}
        >
          {t("dealer")}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {accountType === "dealer" ? t("dealerHint") : t("individualHint")}
      </p>

      <div className="space-y-2">
        <Label htmlFor="displayName">{t("displayName")}</Label>
        <Input id="displayName" name="displayName" required minLength={2} />
      </div>

      {accountType === "dealer" && (
        <div className="space-y-2">
          <Label htmlFor="businessName">{t("businessName")}</Label>
          <Input id="businessName" name="businessName" required minLength={2} />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">{t("emailOptional")}</Label>
        <Input id="email" name="email" type="email" autoComplete="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">{t("phoneOptional")}</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          dir="ltr"
          autoComplete="tel"
          aria-describedby="phone-hint"
        />
        <p id="phone-hint" className="text-xs text-muted-foreground">
          {t("emailOrPhoneHint")}
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{t("password")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          aria-describedby="password-hint"
        />
        <p id="password-hint" className="text-xs text-muted-foreground">
          {t("passwordHint")}
        </p>
      </div>

      <div className="flex items-start gap-2">
        <input
          id="acceptTerms"
          name="acceptTerms"
          type="checkbox"
          required
          className="mt-0.5 size-4 shrink-0 accent-primary"
        />
        <Label
          htmlFor="acceptTerms"
          className="text-sm leading-snug font-normal"
        >
          <span>
            {t.rich("acceptTerms", {
              terms: (chunks) => (
                <Link
                  href="/terms"
                  className="font-medium text-primary underline"
                >
                  {chunks}
                </Link>
              ),
              privacy: (chunks) => (
                <Link
                  href="/privacy"
                  className="font-medium text-primary underline"
                >
                  {chunks}
                </Link>
              ),
            })}
          </span>
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={pending || !!success}>
        {pending ? t("creating") : t("createAccount")}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {t("haveAccount")}{" "}
        <Link href="/auth/login" className="font-medium text-primary">
          {t("signIn")}
        </Link>
      </p>
    </form>
  );
}
