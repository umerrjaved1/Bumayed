import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { DealerDashboardClient } from "@/components/dealer/dealer-dashboard";
import { getDealerDashboard } from "@/modules/dealer/service";

export const dynamic = "force-dynamic";

export default async function DealerDashboardPage({
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
  if (session.user.role !== "DEALER" && session.user.role !== "SUPER_ADMIN") {
    redirect(`/${locale}/dashboard`);
  }

  const t = await getTranslations("dealerDashboard");
  const data = await getDealerDashboard({
    id: session.user.id,
    role: session.user.role,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      <div className="mt-8">
        <DealerDashboardClient
          initial={{
            profile: data.profile
              ? {
                  ...data.profile,
                  verifiedAt: data.profile.verifiedAt
                    ? data.profile.verifiedAt.toISOString()
                    : null,
                }
              : null,
            inventory: data.inventory,
            subscription: data.subscription,
          }}
        />
      </div>
    </div>
  );
}
