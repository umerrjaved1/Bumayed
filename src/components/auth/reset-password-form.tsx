"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ResetPasswordForm({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
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
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token,
          password: String(fd.get("password") ?? ""),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message ?? t("errors.generic"));
        return;
      }
      router.push("/auth/login");
    } catch {
      setError(t("errors.generic"));
    } finally {
      setPending(false);
    }
  }

  if (!email || !token) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{t("invalidResetLink")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="password">{t("newPassword")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("saving") : t("resetPassword")}
      </Button>
      <p className="text-center text-sm">
        <Link href="/auth/login" className="text-primary">
          {t("backToLogin")}
        </Link>
      </p>
    </form>
  );
}
