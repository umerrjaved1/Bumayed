import type { Role } from "@/generated/prisma/client";

export type SessionUser = {
  id: string;
  role: Role;
};

export function isModerator(user: SessionUser | null | undefined): boolean {
  return user?.role === "MODERATOR" || user?.role === "SUPER_ADMIN";
}

/** Ownership: seller may act on their own listing; moderators may moderate. */
export function canManageListing(
  user: SessionUser | null | undefined,
  sellerId: string,
): boolean {
  if (!user) return false;
  if (user.id === sellerId) return true;
  return isModerator(user);
}

export function assertCanManageListing(
  user: SessionUser | null | undefined,
  sellerId: string,
): void {
  if (!canManageListing(user, sellerId)) {
    throw new Error("FORBIDDEN");
  }
}
