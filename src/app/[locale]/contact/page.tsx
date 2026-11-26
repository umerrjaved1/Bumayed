import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Clock, Mail, MessageCircle, Phone } from "lucide-react";
import { ContentPage } from "@/components/shared/content-page";
import { publicMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "content.contact" });
  return publicMetadata({
    locale,
    path: "/contact",
    title: t("title"),
    description: t("intro"),
  });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("content.contact");

  const channels = [
    {
      icon: Mail,
      label: t("emailLabel"),
      value: t("email"),
      href: `mailto:${t("email")}`,
    },
    {
      icon: Phone,
      label: t("phoneLabel"),
      value: t("phone"),
      href: `tel:${t("phone").replace(/\s/g, "")}`,
    },
    {
      icon: MessageCircle,
      label: t("whatsappLabel"),
      value: t("phone"),
      href: `https://wa.me/${t("phone").replace(/[\s+]/g, "")}`,
    },
    { icon: Clock, label: t("hoursLabel"), value: t("hours"), href: null },
  ];

  return (
    <ContentPage namespace="contact">
      <p className="leading-relaxed text-muted-foreground">{t("intro")}</p>
      <ul className="mt-6 space-y-4">
        {channels.map(({ icon: Icon, label, value, href }) => (
          <li key={label} className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              {href ? (
                <a
                  href={href}
                  className="font-medium hover:text-accent hover:underline"
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  {value}
                </a>
              ) : (
                <p className="font-medium">{value}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </ContentPage>
  );
}
