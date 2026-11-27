import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { isEmailDeliveryConfigured } from "@/lib/email";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { MailX } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("forgotTitle") };
}

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");
  // Without an email service no reset link can ever arrive, so say so plainly.
  const emailAvailable = isEmailDeliveryConfigured();

  return (
    <AuthShell
      title={emailAvailable ? t("forgotTitle") : t("forgotUnavailableTitle")}
      subtitle={emailAvailable ? t("forgotSubtitle") : undefined}
      icon={
        emailAvailable ? undefined : (
          <span className="grid size-14 place-items-center rounded-2xl bg-accent/15 text-accent">
            <MailX className="size-7" aria-hidden />
          </span>
        )
      }
    >
      {emailAvailable ? (
        <ForgotPasswordForm />
      ) : (
        <div className="space-y-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("forgotUnavailableBody")}
          </p>
          <Button
            variant="accent"
            className="h-12 w-full rounded-xl text-base font-semibold"
            render={<Link href="/contact" />}
          >
            {t("contactSupport")}
          </Button>
          <p className="text-center text-sm">
            <Link href="/auth/login" className="font-semibold text-primary">
              {t("backToLogin")}
            </Link>
          </p>
        </div>
      )}
    </AuthShell>
  );
}
