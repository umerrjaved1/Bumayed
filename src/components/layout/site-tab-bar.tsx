import { auth } from "@/auth";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";

/** Server wrapper: resolves the session once, then renders the phone tab bar. */
export async function SiteTabBar() {
  const session = await auth();
  const role = session?.user?.role;
  const accountHref =
    role === "SUPER_ADMIN" || role === "MODERATOR"
      ? "/admin"
      : role === "DEALER"
        ? "/dashboard/dealer"
        : "/dashboard";
  return <MobileTabBar signedIn={!!session?.user} accountHref={accountHref} />;
}
