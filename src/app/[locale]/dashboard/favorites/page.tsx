import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { requireSessionUser } from "@/lib/auth-session";
import { toPublicDto } from "@/modules/listings/mappers";
import * as repo from "@/modules/listings/repository";
import { Heart } from "lucide-react";
import { ListingCard } from "@/components/shared/listing-card";
import { EmptyState } from "@/components/shared/empty-state";

export const dynamic = "force-dynamic";

export default async function FavoritesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user)
    redirect(
      `/${locale}/auth/login?callbackUrl=${encodeURIComponent(`/${locale}/dashboard/favorites`)}`,
    );

  const user = await requireSessionUser();
  const rows = await repo.listFavorites(user.id);
  const items = rows.map((r) => toPublicDto(r.listing));
  const t = await getTranslations("favorites");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <h1 className="font-heading text-[2rem] font-extrabold tracking-tight sm:text-4xl">
        {t("title")}
      </h1>
      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Heart}
            title={t("emptyTitle")}
            body={t("emptyBody")}
            actionLabel={t("browse")}
            actionHref="/cars"
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {items.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
