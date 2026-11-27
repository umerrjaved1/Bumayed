import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSession } from "@/lib/session";
import { VerifyResult } from "@/components/auth/verify-result";
import { verifyEmail } from "@/modules/auth/service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("verifyTitle") };
}

export const dynamic = "force-dynamic";

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
  const session = await getSession();

  let ok = false;
  let message = "";

  if (sp.email && sp.token) {
    const result = await verifyEmail({
      email: sp.email,
      token: sp.token,
      ip: "verify-page",
    });
    if (result.ok) {
      ok = true;
    } else if (result.code === "RATE_LIMITED") {
      // The server's own wording is English only; use the page's language.
      message = t("resendRateLimited");
    }
  } else {
    message = t("invalidVerifyLink");
  }

  return (
    <VerifyResult
      ok={ok}
      email={sp.email ?? null}
      signedIn={!!session?.user}
      message={message}
    />
  );
}
