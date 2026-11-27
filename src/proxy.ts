import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { isGccCountry } from "@/lib/geo-codes";

// Next.js 16 "proxy" convention (formerly middleware): locale routing only.
// Auth session attachment is added here in Phase 4.
const intlMiddleware = createMiddleware(routing);

/**
 * First visit from anywhere in the GCC (UAE, Saudi Arabia, Qatar, Kuwait,
 * Bahrain, Oman) opens in Arabic. Only applies when the visitor
 * has not chosen a language yet: no locale in the URL (shared links such as
 * /en/cars are respected) and no saved language cookie (set as soon as
 * they open any page or use the language button).
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = routing.locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  const hasChoice = request.cookies.has("NEXT_LOCALE");
  // Set by Vercel from the visitor's IP address.
  const country = request.headers.get("x-vercel-ip-country");

  if (!hasLocale && !hasChoice && isGccCountry(country)) {
    const url = request.nextUrl.clone();
    url.pathname = `/ar${pathname === "/" ? "" : pathname}`;
    const response = NextResponse.redirect(url);
    // Depends on the visitor's location, so never share it between visitors.
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  return intlMiddleware(request);
}

export const config = {
  // Skip API routes, Next internals, metadata files and static assets.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
