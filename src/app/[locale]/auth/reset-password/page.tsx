import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default async function ResetPasswordPage({
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

  return (
    <AuthShell title={t("resetTitle")} subtitle={t("resetSubtitle")}>
      <ResetPasswordForm email={sp.email ?? ""} token={sp.token ?? ""} />
    </AuthShell>
  );
}
