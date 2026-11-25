import { ListingStatus } from "@/generated/prisma/client";
import { assertTransition, type LifecycleActor } from "./lifecycle";
import { toPublicDto } from "./mappers";
import {
  assertCanManageListing,
  isModerator,
  type SessionUser,
} from "./policies";
import * as repo from "./repository";
import type {
  ListingPublicDto,
  ListingQuery,
  VehicleCategoryCode,
} from "./types";
import { PAGE_SIZE } from "./types";

export { PAGE_SIZE };

export async function searchPublicListings(q: ListingQuery) {
  const { rows, total, page, totalPages } = await repo.searchListings(q);
  return {
    items: rows.map(toPublicDto),
    total,
    page,
    totalPages,
    pageSize: PAGE_SIZE,
  };
}

export async function getPublicListingBySlug(
  slug: string,
): Promise<ListingPublicDto | null> {
  const row = await repo.findActiveBySlug(slug);
  return row ? toPublicDto(row) : null;
}

export async function getFeaturedListings(
  limit = 6,
): Promise<ListingPublicDto[]> {
  const rows = await repo.findFeatured(limit);
  return rows.map(toPublicDto);
}

export async function getLatestListings(limit = 6): Promise<ListingPublicDto[]> {
  const rows = await repo.findLatest(limit);
  return rows.map(toPublicDto);
}

export async function getSimilarListings(
  category: VehicleCategoryCode,
  excludeSlug: string,
  limit = 3,
): Promise<ListingPublicDto[]> {
  const rows = await repo.findSimilar(category, excludeSlug, limit);
  return rows.map(toPublicDto);
}

export async function getMakesForCategory(category: VehicleCategoryCode) {
  return repo.findMakesForCategory(category);
}

/**
 * Transition a listing through the state machine.
 * Ownership and actor role are enforced here (never trust the client).
 */
export async function transitionListing(input: {
  listingId: string;
  to: ListingStatus;
  actor: LifecycleActor;
  user: SessionUser | null;
  rejectionReason?: string;
}) {
  const row = await repo.findListingById(input.listingId);
  if (!row) throw new Error("NOT_FOUND");

  if (input.actor === "user") {
    assertCanManageListing(input.user, row.sellerId);
    if (isModerator(input.user) && input.user?.id !== row.sellerId) {
      // Moderators use actor "moderator" for moderation transitions
      throw new Error("FORBIDDEN");
    }
  } else if (input.actor === "moderator") {
    if (!isModerator(input.user)) throw new Error("FORBIDDEN");
  }

  assertTransition(row.status, input.to, input.actor);

  const now = new Date();
  const data: Parameters<typeof repo.updateListingStatus>[1] = {
    status: input.to,
  };

  if (input.to === ListingStatus.PENDING) data.submittedAt = now;
  if (input.to === ListingStatus.ACTIVE) {
    data.approvedAt = now;
    data.rejectedAt = null;
    data.rejectionReason = null;
    if (row.status === ListingStatus.EXPIRED) {
      data.expiresAt = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    }
  }
  if (input.to === ListingStatus.REJECTED) {
    data.rejectedAt = now;
    data.rejectionReason = input.rejectionReason ?? "Rejected by moderator";
  }
  if (input.to === ListingStatus.SOLD) data.soldAt = now;
  if (input.to === ListingStatus.REMOVED) data.removedAt = now;

  const updated = await repo.updateListingStatus(input.listingId, data);
  return toPublicDto(updated);
}
