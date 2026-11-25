import type { Role } from "@/generated/prisma/client";
import type { SessionUser } from "@/modules/listings/policies";

/**
 * Admin capabilities (ROUTES_AND_PAGES.md §6).
 * Client role claims are never trusted — always call these server-side.
 */
export type AdminCapability =
  | "admin.dashboard"
  | "admin.listings.moderate"
  | "admin.reports.resolve"
  | "admin.users.view"
  | "admin.users.suspend"
  | "admin.dealers.view"
  | "admin.dealers.verify"
  | "admin.catalog.manage"
  | "admin.locations.manage"
  | "admin.commercial.manage"
  | "admin.content.manage"
  | "admin.admins.manage"
  | "admin.audit.view";

const SUPER_ONLY: AdminCapability[] = [
  "admin.users.suspend",
  "admin.dealers.verify",
  "admin.catalog.manage",
  "admin.locations.manage",
  "admin.commercial.manage",
  "admin.content.manage",
  "admin.admins.manage",
  "admin.audit.view",
];

const MODERATOR_CAPS: AdminCapability[] = [
  "admin.dashboard",
  "admin.listings.moderate",
  "admin.reports.resolve",
  "admin.users.view",
  "admin.dealers.view",
];

export function isAdminRole(role: Role | null | undefined): boolean {
  return role === "MODERATOR" || role === "SUPER_ADMIN";
}

export function isSuperAdmin(user: SessionUser | null | undefined): boolean {
  return user?.role === "SUPER_ADMIN";
}

export function can(user: SessionUser | null | undefined, capability: AdminCapability): boolean {
  if (!user) return false;
  if (user.role === "SUPER_ADMIN") return true;
  if (user.role === "MODERATOR") {
    if (SUPER_ONLY.includes(capability)) return false;
    return MODERATOR_CAPS.includes(capability);
  }
  return false;
}

export function assertCan(
  user: SessionUser | null | undefined,
  capability: AdminCapability,
): void {
  if (!can(user, capability)) {
    throw new Error(user ? "FORBIDDEN" : "UNAUTHORIZED");
  }
}

export function assertAdmin(user: SessionUser | null | undefined): void {
  if (!user) throw new Error("UNAUTHORIZED");
  if (!isAdminRole(user.role)) throw new Error("FORBIDDEN");
}
