import { redirect } from "next/navigation";
import { getLocale, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { Inbox } from "@/components/notifications/inbox";
import { listInbox } from "@/modules/notifications/service";

export const dynamic = "force-dynamic";

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/auth/login`);
  const items = await listInbox(session.user.id);
  const current = await getLocale();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">{current === "ar" ? "الإشعارات" : "Notifications"}</h1>
      <div className="mt-6">
        <Inbox
          items={items.map((n) => ({
            id: n.id,
            title: current === "ar" ? n.titleAr : n.titleEn,
            body: current === "ar" ? n.bodyAr : n.bodyEn,
            read: !!n.readAt,
            createdAt: n.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
