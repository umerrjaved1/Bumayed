import { z } from "zod";
import { PLATE_CODE_RE, PLATE_NUMBER_RE, isPlateEmirate, isPlateType } from "./plates";

export const categoryCodeSchema = z.enum(["cars", "motorcycles", "boats", "plates"]);

const e164OrEmpty = z.union([
  z.literal(""),
  z.string().regex(/^\+[1-9]\d{7,14}$/),
]);

const baseListingSchema = z.object({
  category: categoryCodeSchema,
  title: z.string().trim().min(8).max(120),
  description: z.string().trim().min(20).max(5000),
  // What the seller types, in whole units of their country's currency. The
  // currency itself is never taken from the client: it comes from the region.
  price: z.coerce.number().int().positive().max(100_000_000).optional(),
  /** Older clients sent the price as priceAed (UAE, dirhams). Still accepted. */
  priceAed: z.coerce.number().int().positive().max(100_000_000).optional(),
  negotiable: z.boolean().optional().default(false),
  makeId: z.string().uuid().nullish(),
  modelId: z.string().uuid().nullish(),
  trimId: z.string().uuid().nullish(),
  // Plates have no model year; every other category requires one (checked below).
  year: z.coerce
    .number()
    .int()
    .min(1950)
    .max(new Date().getFullYear() + 1)
    .nullish(),
  mileageKm: z.coerce.number().int().min(0).max(2_000_000).nullish(),
  // Region code of any GCC country; checked against the database on save.
  emirateCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "Choose a region"),
  cityId: z.string().uuid(),
  areaId: z.string().uuid().nullish(),
  specs: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
    .optional()
    .default({}),
  contactPhone: e164OrEmpty.optional(),
  contactWhatsapp: e164OrEmpty.optional(),
  videoUrl: z.union([z.literal(""), z.string().url()]).nullish(),
  submit: z.boolean().optional().default(false),
});

export const listingWriteSchema = baseListingSchema.superRefine((d, ctx) => {
  if (d.price == null && d.priceAed == null) {
    ctx.addIssue({ code: "custom", path: ["price"], message: "Enter a price" });
  }
  if (d.category === "plates") {
    const s = d.specs;
    if (!isPlateEmirate(s.plateEmirate)) {
      ctx.addIssue({ code: "custom", path: ["specs", "plateEmirate"], message: "Choose the issuing emirate" });
    }
    if (typeof s.plateCode !== "string" || !PLATE_CODE_RE.test(s.plateCode)) {
      ctx.addIssue({ code: "custom", path: ["specs", "plateCode"], message: "Plate code must be 1–2 letters or digits" });
    }
    if (typeof s.plateNumber !== "string" || !PLATE_NUMBER_RE.test(s.plateNumber)) {
      ctx.addIssue({ code: "custom", path: ["specs", "plateNumber"], message: "Plate number must be 1–5 digits" });
    }
    if (s.plateType !== undefined && !isPlateType(s.plateType)) {
      ctx.addIssue({ code: "custom", path: ["specs", "plateType"], message: "Invalid plate type" });
    }
  } else if (d.year == null) {
    ctx.addIssue({ code: "custom", path: ["year"], message: "Year is required" });
  }
});

export type ListingWriteInput = z.infer<typeof listingWriteSchema>;

export const listingActionSchema = z.object({
  action: z.enum([
    "submit",
    "pause",
    "reactivate",
    "renew",
    "sold",
    "remove",
  ]),
});
