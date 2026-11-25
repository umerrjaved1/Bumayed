import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { SellerListings } from "@/components/seller/seller-listings";

export const dynamic = "force-dynamic";

export default async function SellerListingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/auth/login`);
  return <SellerListings />;
}
