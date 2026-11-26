import {
  ListingStatus,
  PromotionType,
  ReportStatus,
  Role,
  UserStatus,
  type DealerVerificationStatus,
} from "@/generated/prisma/client";
import type { SessionUser } from "@/modules/listings/policies";
import { transitionListing } from "@/modules/listings/service";
import { sanitizeRichText } from "@/modules/content/sanitize";
import { writeAuditLog } from "./audit";
import { assertCan, isSuperAdmin } from "./policies";
import * as repo from "./repository";
import type {
  dealerVerifySchema,
  listingModerateSchema,
  reportCreateSchema,
  reportResolveSchema,
  userStatusSchema,
} from "./schemas";
import type { z } from "zod";

type ListingModerate = z.infer<typeof listingModerateSchema>;
type UserStatusInput = z.infer<typeof userStatusSchema>;
type DealerVerify = z.infer<typeof dealerVerifySchema>;
type ReportResolve = z.infer<typeof reportResolveSchema>;
type ReportCreate = z.infer<typeof reportCreateSchema>;

export async function getAdminDashboard(user: SessionUser) {
  assertCan(user, "admin.dashboard");
  return repo.getDashboardCounts();
}

export async function searchAdminUsers(
  user: SessionUser,
  input: { q?: string; role?: Role; status?: UserStatus },
) {
  assertCan(user, "admin.users.view");
  return repo.listUsers(input);
}

export async function setUserStatus(
  actor: SessionUser,
  targetId: string,
  input: UserStatusInput,
  ip?: string | null,
) {
  assertCan(actor, "admin.users.suspend");
  const target = await repo.findUserById(targetId);
  if (!target) throw new Error("NOT_FOUND");
  if (target.role === Role.SUPER_ADMIN && !isSuperAdmin(actor)) {
    throw new Error("FORBIDDEN");
  }
  if (target.id === actor.id) throw new Error("CANNOT_SELF");

  const before = target.status;
  const updated = await repo.updateUserStatus(targetId, input.status);
  await writeAuditLog({
    actorId: actor.id,
    action: "user.status_change",
    targetType: "User",
    targetId,
    metadata: { before, after: input.status, note: input.note ?? null },
    ip,
  });
  return updated;
}

export async function setAdminRole(
  actor: SessionUser,
  targetId: string,
  role: Role,
  ip?: string | null,
) {
  assertCan(actor, "admin.admins.manage");
  const target = await repo.findUserById(targetId);
  if (!target) throw new Error("NOT_FOUND");
  if (target.id === actor.id) throw new Error("CANNOT_SELF");
  if (target.role === Role.SUPER_ADMIN && role !== Role.SUPER_ADMIN) {
    // Prevent demoting the last super admin accidentally via simple guard
    const admins = await repo.listAdminUsers();
    const supers = admins.filter((a) => a.role === Role.SUPER_ADMIN);
    if (supers.length <= 1) throw new Error("LAST_SUPER_ADMIN");
  }

  const before = target.role;
  const updated = await repo.updateUserRole(targetId, role);
  await writeAuditLog({
    actorId: actor.id,
    action: "user.role_change",
    targetType: "User",
    targetId,
    metadata: { before, after: role },
    ip,
  });
  return updated;
}

export async function listAdminDealers(
  user: SessionUser,
  status?: DealerVerificationStatus,
) {
  assertCan(user, "admin.dealers.view");
  return repo.listDealers({ status });
}

export async function verifyDealer(
  actor: SessionUser,
  dealerId: string,
  input: DealerVerify,
  ip?: string | null,
) {
  assertCan(actor, "admin.dealers.verify");
  const updated = await repo.updateDealerVerification({
    dealerId,
    status: input.status,
    note: input.note,
  });
  await writeAuditLog({
    actorId: actor.id,
    action: "dealer.verify",
    targetType: "DealerProfile",
    targetId: dealerId,
    metadata: { status: input.status, note: input.note ?? null },
    ip,
  });
  return updated;
}

export async function listAdminListings(
  user: SessionUser,
  input: { status?: ListingStatus; q?: string },
) {
  assertCan(user, "admin.listings.moderate");
  return repo.listListingsForAdmin(input);
}

export async function moderateListing(
  actor: SessionUser,
  listingId: string,
  input: ListingModerate,
  ip?: string | null,
) {
  assertCan(actor, "admin.listings.moderate");

  if (input.action === "approve") {
    const listing = await transitionListing({
      listingId,
      to: ListingStatus.ACTIVE,
      actor: "moderator",
      user: actor,
    });
    await writeAuditLog({
      actorId: actor.id,
      action: "listing.approve",
      targetType: "Listing",
      targetId: listingId,
      ip,
    });
    return { listing, promotion: null };
  }

  if (input.action === "reject") {
    if (!input.reason?.trim()) throw new Error("REASON_REQUIRED");
    const listing = await transitionListing({
      listingId,
      to: ListingStatus.REJECTED,
      actor: "moderator",
      user: actor,
      rejectionReason: input.reason.trim(),
    });
    await writeAuditLog({
      actorId: actor.id,
      action: "listing.reject",
      targetType: "Listing",
      targetId: listingId,
      metadata: { reason: input.reason.trim() },
      ip,
    });
    return { listing, promotion: null };
  }

  if (input.action === "remove") {
    const listing = await transitionListing({
      listingId,
      to: ListingStatus.REMOVED,
      actor: "moderator",
      user: actor,
    });
    await writeAuditLog({
      actorId: actor.id,
      action: "listing.remove",
      targetType: "Listing",
      targetId: listingId,
      ip,
    });
    return { listing, promotion: null };
  }

  // feature
  const days = input.featureDays ?? 7;
  const type = input.promotionType ?? PromotionType.FEATURED;
  const promotion = await repo.createFeaturePromotion({
    listingId,
    type,
    days,
  });
  await writeAuditLog({
    actorId: actor.id,
    action: "listing.feature",
    targetType: "Listing",
    targetId: listingId,
    metadata: { type, days },
    ip,
  });
  return { listing: null, promotion };
}

export async function listAdminReports(
  user: SessionUser,
  status?: ReportStatus,
) {
  assertCan(user, "admin.reports.resolve");
  return repo.listReports({ status });
}

export async function resolveReport(
  actor: SessionUser,
  reportId: string,
  input: ReportResolve,
  ip?: string | null,
) {
  assertCan(actor, "admin.reports.resolve");
  const updated = await repo.updateReport(reportId, {
    status: input.status,
    resolution: input.resolution,
    resolvedBy: { connect: { id: actor.id } },
  });
  await writeAuditLog({
    actorId: actor.id,
    action: "report.resolve",
    targetType: "Report",
    targetId: reportId,
    metadata: { status: input.status },
    ip,
  });
  if (updated.reporterId) {
    const { notify } = await import("@/modules/notifications/service");
    const { NotificationType } = await import("@/generated/prisma/client");
    await notify({
      userId: updated.reporterId,
      type: NotificationType.REPORT_RESOLVED,
      dedupKey: `REPORT:${updated.id}:${input.status}`,
      copy: {
        titleEn: "Your report was reviewed",
        titleAr: "تمت مراجعة بلاغك",
        bodyEn: input.resolution,
        bodyAr: input.resolution,
      },
    }).catch((err) => console.error("report notification", err));
  }
  return updated;
}

export async function createPublicReport(
  input: ReportCreate,
  reporterId?: string | null,
) {
  return repo.createReport({
    listing: { connect: { id: input.listingId } },
    reason: input.reason,
    details: input.details ?? null,
    guestContact: reporterId ? null : (input.guestContact ?? null),
    reporter: reporterId ? { connect: { id: reporterId } } : undefined,
    status: ReportStatus.OPEN,
  });
}

export async function getCatalog(user: SessionUser) {
  assertCan(user, "admin.catalog.manage");
  const [categories, makes] = await Promise.all([
    repo.listCategories(),
    repo.listMakes(),
  ]);
  return { categories, makes };
}

export async function getLocations(user: SessionUser) {
  assertCan(user, "admin.locations.manage");
  return repo.listEmiratesWithCities();
}

export async function getCommercial(user: SessionUser) {
  assertCan(user, "admin.commercial.manage");
  const [packages, promotionPrices] = await Promise.all([
    repo.listPackages(),
    repo.listPromotionPrices(),
  ]);
  return { packages, promotionPrices };
}

export async function savePackage(
  actor: SessionUser,
  id: string | null,
  data: Parameters<typeof repo.upsertPackage>[1],
  ip?: string | null,
) {
  assertCan(actor, "admin.commercial.manage");
  const saved = await repo.upsertPackage(id, data);
  await writeAuditLog({
    actorId: actor.id,
    action: id ? "package.update" : "package.create",
    targetType: "Package",
    targetId: saved.id,
    metadata: { name: saved.name, priceAed: saved.priceAed },
    ip,
  });
  return saved;
}

export async function getContent(user: SessionUser) {
  assertCan(user, "admin.content.manage");
  const [pages, banners] = await Promise.all([
    repo.listContentPages(),
    repo.listBanners(),
  ]);
  return { pages, banners };
}

export async function saveContentPage(
  actor: SessionUser,
  slug: string,
  data: Parameters<typeof repo.updateContentPage>[1],
  ip?: string | null,
) {
  assertCan(actor, "admin.content.manage");
  const saved = await repo.updateContentPage(slug, {
    ...data,
    bodyEn: sanitizeRichText(data.bodyEn),
    bodyAr: sanitizeRichText(data.bodyAr),
  });
  await writeAuditLog({
    actorId: actor.id,
    action: "content.update",
    targetType: "ContentPage",
    targetId: saved.id,
    metadata: { slug, status: saved.status },
    ip,
  });
  return saved;
}

export async function saveBanner(
  actor: SessionUser,
  input: {
    titleEn: string;
    titleAr?: string | null;
    imageKey: string;
    linkUrl?: string | null;
    position: string;
    width?: number | null;
    height?: number | null;
  },
  ip?: string | null,
) {
  assertCan(actor, "admin.content.manage");
  if (!input.titleEn.trim() || !input.imageKey.trim()) throw new Error("VALIDATION");
  const { assertBannerSize, assertSafeLink } = await import("@/modules/content/sanitize");
  assertBannerSize(input.width, input.height);
  const linkUrl = assertSafeLink(input.linkUrl);
  const banner = await repo.createBanner({
    titleEn: input.titleEn,
    titleAr: input.titleAr,
    imageKey: input.imageKey,
    linkUrl,
    position: input.position,
  });
  await writeAuditLog({
    actorId: actor.id,
    action: "banner.create",
    targetType: "Banner",
    targetId: banner.id,
    metadata: { position: banner.position },
    ip,
  });
  return banner;
}

export async function getAdmins(user: SessionUser) {
  assertCan(user, "admin.admins.manage");
  return repo.listAdminUsers();
}

export async function getAuditLog(user: SessionUser) {
  assertCan(user, "admin.audit.view");
  return repo.listAuditLogs();
}
