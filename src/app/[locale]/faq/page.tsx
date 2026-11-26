import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ContentPage } from "@/components/shared/content-page";
import { publicMetadata } from "@/lib/seo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const QA = ["1", "2", "3", "4"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "content.faq" });
  return publicMetadata({
    locale,
    path: "/faq",
    title: t("title"),
    description: t("a1"),
  });
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("content.faq");

  return (
    <ContentPage namespace="faq">
      <Accordion>
        {QA.map((n) => (
          <AccordionItem key={n} value={n}>
            <AccordionTrigger>{t(`q${n}`)}</AccordionTrigger>
            <AccordionContent>{t(`a${n}`)}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </ContentPage>
  );
}
