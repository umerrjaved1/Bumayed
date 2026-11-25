import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { verifyEmail } from "@/modules/auth/service";

export default async function VerifyEmailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ email?: string; token?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");
  const sp = await searchParams;

  let ok = false;
  let message = t("invalidVerifyLink");

  if (sp.email && sp.token) {
    const result = await verifyEmail({
      email: sp.email,
      token: sp.token,
      ip: "verify-page",
    });
    if (result.ok) {
      ok = true;
      message = t("verifySuccess");
    } else {
      message = result.message;
    }
  }

  return (
    <AuthShell title={t("verifyTitle")}>
      <Alert variant={ok ? "default" : "destructive"}>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
      <Button className="mt-6 w-full" render={<Link href="/auth/login" />}>
        {t("backToLogin")}
      </Button>
    </AuthShell>
  );
}
