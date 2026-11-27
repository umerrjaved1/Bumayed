import { ListingStatus, Prisma, VideoProvider } from "@/generated/prisma/client";
import { parseVideoUrl } from "@/lib/video";
import { toPublicDto } from "./mappers";
import { assertCanManageListing, type SessionUser } from "./policies";
import * as repo from "./repository";
import { isCurrency, maxPriceFor, toAedEquivalent } from "@/lib/currency";
import type { CurrencyCode } from "@/lib/gcc";
import { assertListingQuota } from "@/modules/payments/service";
import { slugifyTitle } from "./slug";
import { readPlateSpecs } from "./plates";
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

/**
 * Plates have no make, model, year or mileage; their identity is the
 * emirate + code + number. Store only those (plus the derived digit count the
 * filters use) so a crafted request cannot attach vehicle fields to a plate.
 */
function normalizeCategoryFields(data: ListingWriteInput) {
  if (data.category !== "plates") {
    return {
      specs: data.specs,
      makeId: data.makeId ?? null,
      modelId: data.modelId ?? null,
      trimId: data.trimId ?? null,
      year: data.year ?? null,
      mileageKm: data.mileageKm ?? null,
    };
  }
  const plate = readPlateSpecs(data.specs);
  if (!plate) throw new Error("INVALID_PLATE");
  return {
    specs: {
      plateEmirate: plate.emirate,
      plateCode: plate.code,
      plateNumber: plate.number,
      plateType: plate.type,
      plateDigits: plate.number.length,
    },
    makeId: null,
    modelId: null,
    trimId: null,
    year: null,
    mileageKm: null,
  };
}

/**
 * Price, currency and country for a write. The currency always comes from the
 * region's country (a Saudi ad is in riyals whatever the client sent), and the
 * AED equivalent is worked out here so filters and sorting stay correct.
 */
function resolvePricing(
  data: ListingWriteInput,
  region: { country: { code: string; currency: string; isActive: boolean } },
) {
  if (!region.country.isActive) throw new Error("COUNTRY_UNAVAILABLE");
  const currency = region.country.currency as CurrencyCode;
  if (!isCurrency(currency)) throw new Error("INVALID_PRICE");
  const price = data.price ?? data.priceAed;
  if (price == null || !Number.isInteger(price) || price <= 0) {
    throw new Error("INVALID_PRICE");
  }
  if (price > maxPriceFor(currency)) throw new Error("INVALID_PRICE");
  return {
    price,
    currency,
    priceAed: toAedEquivalent(price, currency),
    countryCode: region.country.code,
  };
}

export async function createSellerListing(input: {
  user: SessionUser;
  data: ListingWriteInput;
}) {
  const description = input.data.description;
  const { findProhibitedTerms } = await import("@/modules/moderation/policy");
  const hits = await findProhibitedTerms(`${input.data.title}\n${description}`);
  if (hits.length > 0) throw new Error("PROHIBITED_CONTENT");

  const category = await repo.findCategoryByCode(input.data.category);
  if (!category) throw new Error("INVALID_CATEGORY");

  const emirate = await repo.findEmirateByCode(input.data.emirateCode);
  if (!emirate) throw new Error("INVALID_EMIRATE");
  if (!(await repo.cityBelongsToEmirate(input.data.cityId, emirate.id))) {
    throw new Error("INVALID_CITY");
  }
  // Validate the video before writing, so a bad link cannot leave a
  // half-saved listing behind (the wizard would then create a duplicate).
  const video = await resolveVideo(input.data.videoUrl);

  // Quota is used when an ad is submitted, not when a draft is saved.
  if (input.data.submit) await assertListingQuota(input.user);
  const status = input.data.submit ? ListingStatus.PENDING : ListingStatus.DRAFT;
  const now = new Date();

  const fields = normalizeCategoryFields(input.data);
  const row = await repo.createListing({
    seller: { connect: { id: input.user.id } },
    category: { connect: { id: category.id } },
    status,
    title: input.data.title,
    slug: slugifyTitle(input.data.title),
    description: input.data.description,
    ...resolvePricing(input.data, emirate),
    negotiable: input.data.negotiable,
    make: fields.makeId ? { connect: { id: fields.makeId } } : undefined,
    model: fields.modelId ? { connect: { id: fields.modelId } } : undefined,
    trim: fields.trimId ? { connect: { id: fields.trimId } } : undefined,
    year: fields.year,
    mileageKm: fields.mileageKm,
    emirate: { connect: { id: emirate.id } },
    city: { connect: { id: input.data.cityId } },
    area: input.data.areaId ? { connect: { id: input.data.areaId } } : undefined,
    specs: fields.specs as Prisma.InputJsonValue,
    contactPhone: emptyToNull(input.data.contactPhone),
    contactWhatsapp: emptyToNull(input.data.contactWhatsapp),
    submittedAt: status === ListingStatus.PENDING ? now : null,
    // expiresAt is set when a moderator approves the ad.
  });

  if (video) {
    await repo.upsertListingVideo({ listingId: row.id, ...video });
  }

  const fresh = await repo.findListingById(row.id);
  if (status === ListingStatus.PENDING && fresh) {
    const { notifyListingEvent } = await import("@/modules/notifications/events");
    await notifyListingEvent({
      sellerId: input.user.id,
      listingId: fresh.id,
      title: fresh.title,
      status: "PENDING",
      cycleAt: fresh.submittedAt,
    }).catch((err) => console.error("listing notification", err));
  }
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

  // Edits must pass the same banned-words check as new ads.
  const { findProhibitedTerms } = await import("@/modules/moderation/policy");
  const hits = await findProhibitedTerms(
    `${input.data.title}
${input.data.description}`,
  );
  if (hits.length > 0) throw new Error("PROHIBITED_CONTENT");

  const category = await repo.findCategoryByCode(input.data.category);
  if (!category) throw new Error("INVALID_CATEGORY");
  const emirate = await repo.findEmirateByCode(input.data.emirateCode);
  if (!emirate) throw new Error("INVALID_EMIRATE");
  if (!(await repo.cityBelongsToEmirate(input.data.cityId, emirate.id))) {
    throw new Error("INVALID_CITY");
  }
  const video = await resolveVideo(input.data.videoUrl);

  let nextStatus: ListingStatus = existing.status;
  let submittedAt = existing.submittedAt;
  if (
    input.data.submit &&
    (existing.status === ListingStatus.DRAFT ||
      existing.status === ListingStatus.REJECTED)
  ) {
    // First submission uses a quota slot; resubmitting a rejected ad does not.
    if (!existing.submittedAt) await assertListingQuota(input.user);
    nextStatus = ListingStatus.PENDING;
    submittedAt = new Date();
  }

  // Changing the text or video of a live or paused ad sends it back to a
  // moderator, so approved ads cannot be edited into something else.
  // Price, contact and spec changes stay live.
  const textChanged =
    input.data.title.trim() !== existing.title.trim() ||
    input.data.description.trim() !== existing.description.trim() ||
    (video?.originalUrl ?? null) !== (existing.video?.originalUrl ?? null);
  if (
    textChanged &&
    (existing.status === ListingStatus.ACTIVE ||
      existing.status === ListingStatus.PAUSED)
  ) {
    nextStatus = ListingStatus.PENDING;
    submittedAt = new Date();
  }

  const fields = normalizeCategoryFields(input.data);
  await repo.updateListing(input.listingId, {
    category: { connect: { id: category.id } },
    status: nextStatus,
    title: input.data.title,
    description: input.data.description,
    ...resolvePricing(input.data, emirate),
    negotiable: input.data.negotiable,
    make: fields.makeId
      ? { connect: { id: fields.makeId } }
      : { disconnect: true },
    model: fields.modelId
      ? { connect: { id: fields.modelId } }
      : { disconnect: true },
    trim: fields.trimId
      ? { connect: { id: fields.trimId } }
      : { disconnect: true },
    year: fields.year,
    mileageKm: fields.mileageKm,
    emirate: { connect: { id: emirate.id } },
    city: { connect: { id: input.data.cityId } },
    area: input.data.areaId
      ? { connect: { id: input.data.areaId } }
      : { disconnect: true },
    specs: fields.specs as Prisma.InputJsonValue,
    contactPhone: emptyToNull(input.data.contactPhone),
    contactWhatsapp: emptyToNull(input.data.contactWhatsapp),
    submittedAt,
    ...(nextStatus === ListingStatus.PENDING &&
    existing.status === ListingStatus.REJECTED
      ? { rejectedAt: null, rejectionReason: null }
      : {}),
  });

  if (video) {
    await repo.upsertListingVideo({ listingId: input.listingId, ...video });
  } else {
    await repo.deleteListingVideo(input.listingId);
  }

  const fresh = await repo.findListingById(input.listingId);
  if (nextStatus === ListingStatus.PENDING) {
    const { notifyListingEvent } = await import("@/modules/notifications/events");
    await notifyListingEvent({
      sellerId: existing.sellerId,
      listingId: input.listingId,
      title: input.data.title,
      status: "PENDING",
      cycleAt: submittedAt,
    }).catch((err) => console.error("listing notification", err));
  }
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

  if (input.action === "submit") {
    const row = await repo.findListingById(input.listingId);
    if (row && !row.submittedAt) await assertListingQuota(input.user);
  }

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
