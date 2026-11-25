"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: String(fd.get("identifier") ?? ""),
          password: String(fd.get("password") ?? ""),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message ?? t("errors.generic"));
        return;
      }
      router.push("/dashboard");
      router.refresh();
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
      <div className="space-y-2">
        <Label htmlFor="identifier">{t("identifier")}</Label>
        <Input
          id="identifier"
          name="identifier"
          autoComplete="username"
          required
          placeholder={t("identifierPlaceholder")}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="password">{t("password")}</Label>
          <Link
            href="/auth/forgot-password"
            className="text-xs text-muted-foreground hover:text-primary"
          >
            {t("forgotLink")}
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("signingIn") : t("signIn")}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {t("noAccount")}{" "}
        <Link href="/auth/register" className="font-medium text-primary">
          {t("registerLink")}
        </Link>
      </p>
    </form>
  );
}
