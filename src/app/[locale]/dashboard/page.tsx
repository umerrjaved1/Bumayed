import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { listMyListings } from "@/modules/listings/seller-service";

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
    redirect(
      `/${locale}/auth/login?callbackUrl=${encodeURIComponent(`/${locale}/dashboard`)}`,
    );
  }

  const t = await getTranslations("dashboard");
  const listings = await listMyListings({
    id: session.user.id,
    role: session.user.role,
  });

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
            <p className="text-sm text-muted-foreground">
              {t("listingCount", { count: listings.length })}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button render={<Link href="/dashboard/listings" />}>
                {t("manageListings")}
              </Button>
              <Button
                variant="outline"
                render={<Link href="/dashboard/listings/new" />}
              >
                {t("postAd")}
              </Button>
              {session.user.role === "DEALER" ? (
                <Button
                  variant="outline"
                  render={<Link href="/dashboard/packages" />}
                >
                  {t("packagesNav")}
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("favoritesNav")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              render={<Link href="/dashboard/favorites" />}
            >
              {t("viewFavorites")}
            </Button>
            <Button
              variant="ghost"
              render={<Link href="/dashboard/notifications" />}
            >
              {t("notificationsNav")}
            </Button>
          </CardContent>
        </Card>
        {session.user.role === "DEALER" ? (
          <Card>
            <CardHeader>
              <CardTitle>{t("dealerNav")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                render={<Link href="/dashboard/dealer" />}
              >
                {t("dealerNav")}
              </Button>
            </CardContent>
          </Card>
        ) : null}
        {session.user.role === "MODERATOR" ||
        session.user.role === "SUPER_ADMIN" ? (
          <Card>
            <CardHeader>
              <CardTitle>{t("adminNav")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" render={<Link href="/admin" />}>
                {t("adminNav")}
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="mt-8">
        <SignOutButton label={t("signOut")} />
      </div>
    </div>
  );
}
