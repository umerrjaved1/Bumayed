import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSession } from "@/lib/session";
import { VerifyPending } from "@/components/auth/verify-pending";
import { parsePendingMode } from "@/components/auth/pending-mode";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("pendingAlertTitle") };
}

/** Next screen after sign-up: what to do now (open the email link, or start using the site). */
export default async function VerifyPendingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { locale } = await params;
  const { mode } = await searchParams;
  setRequestLocale(locale);
  const session = await getSession();

  return (
    <VerifyPending
      mode={parsePendingMode(mode)}
      signedIn={!!session?.user}
      accountEmail={session?.user?.email ?? null}
      accountPhone={session?.user?.phone ?? null}
    />
  );
}
