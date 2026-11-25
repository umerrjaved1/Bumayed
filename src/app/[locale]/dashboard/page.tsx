import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignOutButton } from "@/components/auth/sign-out-button";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/auth/login`);
  }

  const t = await getTranslations("dashboard");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-muted-foreground">
        {t("welcome", { name: session.user.name ?? "there" })}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t("account")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              {t("role")}: {session.user.role}
            </p>
            <p>
              {t("email")}: {session.user.email ?? "—"}
            </p>
            <p>
              {t("phone")}: {session.user.phone ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("listings")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t("listingsSoon")}</p>
            <Button
              className="mt-4"
              render={<Link href="/dashboard/listings/new" />}
            >
              {t("postAd")}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <SignOutButton label={t("signOut")} />
      </div>
    </div>
  );
}
