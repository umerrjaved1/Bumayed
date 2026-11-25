import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { requireSessionUser } from "@/lib/auth-session";
import { toPublicDto } from "@/modules/listings/mappers";
import * as repo from "@/modules/listings/repository";
import { ListingCard } from "@/components/shared/listing-card";

export const dynamic = "force-dynamic";

export default async function FavoritesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/auth/login`);

  const user = await requireSessionUser();
  const rows = await repo.listFavorites(user.id);
  const items = rows.map((r) => toPublicDto(r.listing));
  const t = await getTranslations("favorites");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      {items.length === 0 ? (
        <p className="mt-6 text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
