import { ListingStatus } from "@/generated/prisma/client";

/**
 * Listing lifecycle state machine (DATABASE_SCHEMA.md §6 / playbook §7.2).
 * Users may only perform USER transitions. Moderation-controlled transitions
 * require admin/moderator and are enforced in policies + service.
 */

export type LifecycleActor = "user" | "moderator" | "system";

const TRANSITIONS: Record<
  ListingStatus,
  Partial<Record<ListingStatus, LifecycleActor[]>>
> = {
  DRAFT: { PENDING: ["user"], REMOVED: ["user", "moderator"] },
  PENDING: {
    ACTIVE: ["moderator"],
    REJECTED: ["moderator"],
    DRAFT: ["user"],
    REMOVED: ["user", "moderator"],
  },
  ACTIVE: {
    PAUSED: ["user"],
    SOLD: ["user"],
    EXPIRED: ["system"],
    REMOVED: ["user", "moderator"],
  },
  PAUSED: { ACTIVE: ["user"], REMOVED: ["user", "moderator"] },
  REJECTED: { DRAFT: ["user"], REMOVED: ["user", "moderator"] },
  EXPIRED: { ACTIVE: ["user"], REMOVED: ["user", "moderator"] },
  SOLD: { REMOVED: ["user", "moderator"] },
  REMOVED: {},
};

export function canTransition(
  from: ListingStatus,
  to: ListingStatus,
  actor: LifecycleActor,
): boolean {
  const allowed = TRANSITIONS[from]?.[to];
  return !!allowed?.includes(actor);
}

export function assertTransition(
  from: ListingStatus,
  to: ListingStatus,
  actor: LifecycleActor,
): void {
  if (!canTransition(from, to, actor)) {
    throw new Error(
      `Invalid listing transition ${from} → ${to} for actor ${actor}`,
    );
  }
}

export { ListingStatus };
