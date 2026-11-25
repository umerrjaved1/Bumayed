import { z } from "zod";
import {
  ContentStatus,
  DealerVerificationStatus,
  ListingStatus,
  PromotionType,
  ReportStatus,
  Role,
  UserStatus,
} from "@/generated/prisma/client";

export const listingModerateSchema = z.object({
  action: z.enum(["approve", "reject", "remove", "feature"]),
  reason: z.string().trim().max(500).optional(),
  promotionType: z.nativeEnum(PromotionType).optional(),
  featureDays: z.number().int().min(1).max(90).optional(),
});

export const userStatusSchema = z.object({
  status: z.enum([
    UserStatus.ACTIVE,
    UserStatus.SUSPENDED,
    UserStatus.BLOCKED,
  ]),
  note: z.string().trim().max(500).optional(),
});

export const dealerVerifySchema = z.object({
  status: z.enum([
    DealerVerificationStatus.APPROVED,
    DealerVerificationStatus.REJECTED,
    DealerVerificationStatus.PENDING,
  ]),
  note: z.string().trim().max(500).optional(),
});

export const reportResolveSchema = z.object({
  status: z.enum([
    ReportStatus.RESOLVED,
    ReportStatus.DISMISSED,
    ReportStatus.UNDER_REVIEW,
  ]),
  resolution: z.string().trim().min(3).max(1000),
});

export const reportCreateSchema = z.object({
  listingId: z.string().uuid(),
  reason: z.string().trim().min(2).max(80),
  details: z.string().trim().max(1000).optional(),
  guestContact: z.string().trim().max(120).optional(),
});

export const contentUpsertSchema = z.object({
  titleEn: z.string().trim().min(1).max(200),
  titleAr: z.string().trim().min(1).max(200),
  bodyEn: z.string().min(1),
  bodyAr: z.string().min(1),
  status: z.nativeEnum(ContentStatus).optional(),
});

export const packageUpsertSchema = z.object({
  name: z.string().trim().min(1).max(120),
  nameAr: z.string().trim().max(120).optional().nullable(),
  priceAed: z.number().int().min(0),
  validityDays: z.number().int().min(1).max(3650),
  monthlyListingQuota: z.number().int().min(0).nullable().optional(),
  featuredSlots: z.number().int().min(0).default(0),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const adminRoleSchema = z.object({
  role: z.enum([Role.MODERATOR, Role.SUPER_ADMIN, Role.INDIVIDUAL, Role.DEALER]),
});

export const listingStatusFilterSchema = z
  .nativeEnum(ListingStatus)
  .optional();
