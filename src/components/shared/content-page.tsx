import { getTranslations } from "next-intl/server";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

/** Shared shell for About/FAQ/Terms/Privacy/Contact — copy lives in messages/*. */
export async function ContentPage({
  namespace,
  children,
}: {
  namespace: string;
  children: React.ReactNode;
}) {
  const t = await getTranslations(`content.${namespace}`);
  const tc = await getTranslations("content");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <Alert className="mt-6 border-warning/50 bg-warning/10">
        <Info className="size-4" aria-hidden />
        <AlertDescription>{tc("draftNotice")}</AlertDescription>
      </Alert>
      <div className="mt-8">{children}</div>
    </div>
  );
}
