import { getLocale, getTranslations } from "next-intl/server";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { sanitizeRichText } from "@/modules/content/sanitize";

/** Shared shell for About/FAQ/Terms/Privacy/Contact. Published DB copy replaces the draft. */
export async function ContentPage({
  namespace,
  children,
}: {
  namespace: string;
  children: React.ReactNode;
}) {
  const page = await prisma.contentPage.findUnique({ where: { slug: namespace } });
  if (page?.status === "PUBLISHED") {
    const locale = await getLocale();
    const title = locale === "ar" ? page.titleAr : page.titleEn;
    const body = sanitizeRichText(locale === "ar" ? page.bodyAr : page.bodyEn);
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <div
          className="mt-8 space-y-4 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      </div>
    );
  }

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

