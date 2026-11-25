import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireAdminPage } from "@/lib/admin-guard";
import { getAuditLog } from "@/modules/admin/service";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireAdminPage(locale, "admin.audit.view");
  const t = await getTranslations("admin");
  const items = await getAuditLog({
    id: session.user.id,
    role: session.user.role,
  });

  return (
    <div>
      <h2 className="text-lg font-semibold">{t("auditHeading")}</h2>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{t("emptyAudit")}</p>
      ) : (
        <ul className="mt-4 divide-y rounded-lg border text-sm">
          {items.map((log) => (
            <li key={log.id} className="px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{log.action}</span>
                <time className="text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString(locale)}
                </time>
              </div>
              <p className="text-muted-foreground">
                {log.actor.profile?.displayName ?? log.actor.email} ·{" "}
                {log.targetType}:{log.targetId.slice(0, 8)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
