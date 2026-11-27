import { getLocale, getTranslations } from "next-intl/server";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { sanitizeRichText } from "@/modules/content/sanitize";

/** Dark title band shared by the content pages, matching the browse pages. */
function ContentHeader({ title }: { title: string }) {
  return (
    <header className="relative isolate overflow-hidden bg-ink text-ink-foreground">
      <div className="bg-grid mask-fade-b absolute inset-0 -z-10 opacity-50" />
      <div
        aria-hidden
        className="animate-float absolute -top-24 end-0 -z-10 size-80 rounded-full bg-accent/20 blur-[100px]"
      />
      <div className="mx-auto max-w-3xl px-4 pt-9 pb-14 sm:px-6 sm:pt-14 sm:pb-20 lg:px-8">
        <h1 className="animate-fade-up font-heading text-[2rem] leading-tight font-extrabold tracking-tight sm:text-5xl">
          {title}
        </h1>
      </div>
    </header>
  );
}

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
      <div>
        <ContentHeader title={title} />
        <div className="mx-auto -mt-8 max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
          <div
            className="animate-fade-up space-y-4 rounded-3xl border bg-card p-5 leading-relaxed shadow-[0_24px_60px_-40px_oklch(0.2_0.05_258/0.45)] sm:p-8"
            style={{ animationDelay: "80ms" }}
            dangerouslySetInnerHTML={{ __html: body }}
          />
        </div>
      </div>
    );
  }

  const t = await getTranslations(`content.${namespace}`);
  const tc = await getTranslations("content");

  return (
    <div>
      <ContentHeader title={t("title")} />
      <div className="mx-auto -mt-8 max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
        <div
          className="animate-fade-up rounded-3xl border bg-card p-5 shadow-[0_24px_60px_-40px_oklch(0.2_0.05_258/0.45)] sm:p-8"
          style={{ animationDelay: "80ms" }}
        >
          <Alert className="rounded-2xl border-warning/50 bg-warning/10">
            <Info className="size-4" aria-hidden />
            <AlertDescription>{tc("draftNotice")}</AlertDescription>
          </Alert>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
