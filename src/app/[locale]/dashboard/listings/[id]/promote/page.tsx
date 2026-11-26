import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { PromoteClient } from "@/components/payments/promote-client";
import { prisma } from "@/lib/prisma";
import { listPromotionOffers } from "@/modules/payments/service";

export const dynamic = "force-dynamic";

export default async function PromotePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user)
    redirect(
      `/${locale}/auth/login?callbackUrl=${encodeURIComponent(`/${locale}/dashboard/listings/${id}/promote`)}`,
    );

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing || listing.sellerId !== session.user.id) notFound();

  const t = await getTranslations("promote");
  const offers = await listPromotionOffers();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <p className="mt-2 text-muted-foreground">
        {listing.title}. {t("subtitle")}
      </p>
      <div className="mt-8">
        <PromoteClient
          listingId={listing.id}
          offers={offers.map((o) => ({
            type: o.type,
            priceAed: o.priceAed,
            durationDays: o.durationDays,
          }))}
        />
      </div>
    </div>
  );
}
