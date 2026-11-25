import { z } from "zod";

export const categoryCodeSchema = z.enum(["cars", "motorcycles", "boats"]);

const e164OrEmpty = z.union([
  z.literal(""),
  z.string().regex(/^\+[1-9]\d{7,14}$/),
]);

export const listingWriteSchema = z.object({
  category: categoryCodeSchema,
  title: z.string().trim().min(8).max(120),
  description: z.string().trim().min(20).max(5000),
  priceAed: z.coerce.number().int().positive().max(100_000_000),
  negotiable: z.boolean().optional().default(false),
  makeId: z.string().uuid().nullish(),
  modelId: z.string().uuid().nullish(),
  trimId: z.string().uuid().nullish(),
  year: z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1),
  mileageKm: z.coerce.number().int().min(0).max(2_000_000).nullish(),
  emirateCode: z.enum(["AUH", "DXB", "SHJ", "AJM", "UAQ", "RAK", "FUJ"]),
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
