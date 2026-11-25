import { ListingStatus, Prisma, VideoProvider } from "@/generated/prisma/client";
import { parseVideoUrl } from "@/lib/video";
import { toPublicDto } from "./mappers";
import { assertCanManageListing, type SessionUser } from "./policies";
import * as repo from "./repository";
import { slugifyTitle } from "./slug";
import { transitionListing } from "./service";
import type { ListingWriteInput } from "./write-schemas";
import { CATEGORY_CODE_TO_ENUM } from "./types";

function emptyToNull(v: string | null | undefined): string | null {
  if (!v || v.trim() === "") return null;
  return v.trim();
}

async function resolveVideo(videoUrl: string | null | undefined) {
  const raw = emptyToNull(videoUrl ?? null);
  if (!raw) return null;
  const parsed = parseVideoUrl(raw);
  if (!parsed) throw new Error("INVALID_VIDEO_URL");
  const provider =
    parsed.provider === "youtube"
      ? VideoProvider.YOUTUBE
      : parsed.provider === "instagram"
        ? VideoProvider.INSTAGRAM
        : VideoProvider.TIKTOK;
  return {
    provider,
    originalUrl: parsed.watchUrl,
    embedUrl: parsed.embedUrl,
  };
}

export async function createSellerListing(input: {
  user: SessionUser;
  data: ListingWriteInput;
}) {
  const category = await repo.findCategoryByCode(input.data.category);
  if (!category) throw new Error("INVALID_CATEGORY");

  const emirate = await repo.findEmirateByCode(input.data.emirateCode);
  if (!emirate) throw new Error("INVALID_EMIRATE");

  const status = input.data.submit ? ListingStatus.PENDING : ListingStatus.DRAFT;
  const now = new Date();

  const row = await repo.createListing({
    seller: { connect: { id: input.user.id } },
    category: { connect: { id: category.id } },
    status,
    title: input.data.title,
    slug: slugifyTitle(input.data.title),
    description: input.data.description,
    priceAed: input.data.priceAed,
    negotiable: input.data.negotiable,
    make: input.data.makeId ? { connect: { id: input.data.makeId } } : undefined,
    model: input.data.modelId ? { connect: { id: input.data.modelId } } : undefined,
    trim: input.data.trimId ? { connect: { id: input.data.trimId } } : undefined,
    year: input.data.year,
    mileageKm: input.data.mileageKm ?? null,
    emirate: { connect: { id: emirate.id } },
    city: { connect: { id: input.data.cityId } },
    area: input.data.areaId ? { connect: { id: input.data.areaId } } : undefined,
    specs: input.data.specs as Prisma.InputJsonValue,
    contactPhone: emptyToNull(input.data.contactPhone),
    contactWhatsapp: emptyToNull(input.data.contactWhatsapp),
    submittedAt: status === ListingStatus.PENDING ? now : null,
    expiresAt:
      status === ListingStatus.PENDING
        ? new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
        : null,
  });

  const video = await resolveVideo(input.data.videoUrl);
  if (video) {
    await repo.upsertListingVideo({ listingId: row.id, ...video });
  }

  const fresh = await repo.findListingById(row.id);
  return toPublicDto(fresh!);
}

export async function updateSellerListing(input: {
  user: SessionUser;
  listingId: string;
  data: ListingWriteInput;
}) {
  const existing = await repo.findListingById(input.listingId);
  if (!existing) throw new Error("NOT_FOUND");
  assertCanManageListing(input.user, existing.sellerId);

  if (
    existing.status !== ListingStatus.DRAFT &&
    existing.status !== ListingStatus.REJECTED &&
    existing.status !== ListingStatus.PAUSED &&
    existing.status !== ListingStatus.ACTIVE
  ) {
    throw new Error("NOT_EDITABLE");
  }

  const category = await repo.findCategoryByCode(input.data.category);
  if (!category) throw new Error("INVALID_CATEGORY");
  const emirate = await repo.findEmirateByCode(input.data.emirateCode);
  if (!emirate) throw new Error("INVALID_EMIRATE");

  let nextStatus: ListingStatus = existing.status;
  let submittedAt = existing.submittedAt;
  if (
    input.data.submit &&
    (existing.status === ListingStatus.DRAFT ||
      existing.status === ListingStatus.REJECTED)
  ) {
    nextStatus = ListingStatus.PENDING;
    submittedAt = new Date();
  }

  await repo.updateListing(input.listingId, {
    category: { connect: { id: category.id } },
    status: nextStatus,
    title: input.data.title,
    description: input.data.description,
    priceAed: input.data.priceAed,
    negotiable: input.data.negotiable,
    make: input.data.makeId
      ? { connect: { id: input.data.makeId } }
      : { disconnect: true },
    model: input.data.modelId
      ? { connect: { id: input.data.modelId } }
      : { disconnect: true },
    trim: input.data.trimId
      ? { connect: { id: input.data.trimId } }
      : { disconnect: true },
    year: input.data.year,
    mileageKm: input.data.mileageKm ?? null,
    emirate: { connect: { id: emirate.id } },
    city: { connect: { id: input.data.cityId } },
    area: input.data.areaId
      ? { connect: { id: input.data.areaId } }
      : { disconnect: true },
    specs: input.data.specs as Prisma.InputJsonValue,
    contactPhone: emptyToNull(input.data.contactPhone),
    contactWhatsapp: emptyToNull(input.data.contactWhatsapp),
    submittedAt,
  });

  const video = await resolveVideo(input.data.videoUrl);
  if (video) {
    await repo.upsertListingVideo({ listingId: input.listingId, ...video });
  } else {
    await repo.deleteListingVideo(input.listingId);
  }

  const fresh = await repo.findListingById(input.listingId);
  return toPublicDto(fresh!);
}

export async function listMyListings(user: SessionUser, status?: ListingStatus) {
  const rows = await repo.findSellerListings(user.id, status);
  return rows.map(toPublicDto);
}

export async function getMyListing(user: SessionUser, listingId: string) {
  const row = await repo.findListingById(listingId);
  if (!row) throw new Error("NOT_FOUND");
  assertCanManageListing(user, row.sellerId);
  return { dto: toPublicDto(row), row };
}

export async function runSellerAction(input: {
  user: SessionUser;
  listingId: string;
  action: "submit" | "pause" | "reactivate" | "renew" | "sold" | "remove";
}) {
  const map = {
    submit: ListingStatus.PENDING,
    pause: ListingStatus.PAUSED,
    reactivate: ListingStatus.ACTIVE,
    renew: ListingStatus.ACTIVE,
    sold: ListingStatus.SOLD,
    remove: ListingStatus.REMOVED,
  } as const;

  return transitionListing({
    listingId: input.listingId,
    to: map[input.action],
    actor: "user",
    user: input.user,
  });
}

export async function getWizardCatalog(category: keyof typeof CATEGORY_CODE_TO_ENUM) {
  const makes = await repo.listMakesWithModels(category);
  return makes.map((m) => ({
    id: m.id,
    nameEn: m.nameEn,
    models: m.models.map((model) => ({
      id: model.id,
      nameEn: model.nameEn,
      trims: model.trims.map((t) => ({ id: t.id, nameEn: t.nameEn })),
    })),
  }));
}

export async function getCitiesForEmirateCode(code: string) {
  const emirate = await repo.findEmirateByCode(code);
  if (!emirate) return [];
  return repo.listCitiesByEmirate(emirate.id);
}

export async function resolveOwnedListing(
  user: SessionUser,
  idOrSlug: string,
) {
  const row =
    (await repo.findListingById(idOrSlug)) ?? (await repo.findBySlug(idOrSlug));
  if (!row) throw new Error("NOT_FOUND");
  assertCanManageListing(user, row.sellerId);
  return row;
}
