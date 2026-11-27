import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { visitorGccCountry } from "@/lib/geo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("signIn") };
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ registered?: string }>;
}) {
  const { locale } = await params;
  const { registered } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("auth");
  const country = await visitorGccCountry();

  return (
    <AuthShell title={t("signIn")} subtitle={t("signInSubtitle")}>
      <LoginForm justRegistered={registered === "1"} defaultDial={country.dial} />
    </AuthShell>
  );
}
