import type { Metadata } from "next";
import { Noto_Sans_Arabic, Plus_Jakarta_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { routing } from "@/i18n/routing";
import { CLIENT_NAMESPACES } from "@/i18n/client-namespaces";
import { siteUrl } from "@/lib/seo";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteTabBar } from "@/components/layout/site-tab-bar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { NavHistoryTracker } from "@/components/layout/nav-history";
import { FavoritesProvider } from "@/components/shared/favorites-provider";
import { getSession } from "@/lib/session";
import "../globals.css";

// One variable font covers body and headings (all weights in a single file).
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

// Not preloaded: English pages only download it if Arabic text appears.
const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-arabic",
  display: "swap",
  preload: false,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: t("homeTitle"), template: `%s — ${t("brand")}` },
    description: t("homeDescription"),
    alternates: {
      canonical: `${siteUrl()}/${locale}`,
      languages: {
        en: `${siteUrl()}/en`,
        ar: `${siteUrl()}/ar`,
        "x-default": `${siteUrl()}/en`,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const dir = locale === "ar" ? "rtl" : "ltr";
  const [allMessages, session] = await Promise.all([
    getMessages(),
    getSession(),
  ]);
  const clientMessages = Object.fromEntries(
    CLIENT_NAMESPACES.filter((ns) => ns in allMessages).map((ns) => [
      ns,
      allMessages[ns],
    ]),
  );

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${jakarta.variable} ${notoSansArabic.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col antialiased">
        <NextIntlClientProvider messages={clientMessages}>
          <TooltipProvider>
            <FavoritesProvider signedIn={!!session?.user}>
              <NavigationProgress />
              <NavHistoryTracker />
              <a
                href="#main"
                className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-foreground"
              >
                {locale === "ar" ? "تخطي إلى المحتوى" : "Skip to content"}
              </a>
              <SiteHeader />
              <main id="main" className="flex-1">
                {children}
              </main>
              <SiteFooter />
              <SiteTabBar />
              <Toaster richColors position="top-center" />
            </FavoritesProvider>
          </TooltipProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
