import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware navigation primitives — always use these instead of
// next/link and next/navigation for internal routes.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
