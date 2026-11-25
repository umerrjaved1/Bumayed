import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// Next.js 16 "proxy" convention (formerly middleware): locale routing only.
// Auth session attachment is added here in Phase 4.
export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals, metadata files and static assets.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
