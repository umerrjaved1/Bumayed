import { z } from "zod";

/**
 * Environment validation — fails fast at boot with clear messages.
 * Add new variables here AND in .env.example (playbook rule 10: never
 * commit secrets; .env.example holds names + descriptions only).
 *
 * Phase 1: everything infrastructure-related is optional because the
 * app runs locally without a database/storage/provider yet. Variables
 * become required in the phase that introduces them.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  // Phase 3 — database
  DATABASE_URL: z.url().optional(),

  // Phase 4 — auth & email
  AUTH_SECRET: z.string().min(32).optional(),
  AUTH_URL: z.url().optional(),
  EMAIL_FROM: z.email().optional(),
  EMAIL_PROVIDER_API_KEY: z.string().optional(),

  // Phase 5 — object storage (R2/S3-compatible)
  STORAGE_ENDPOINT: z.url().optional(),
  STORAGE_REGION: z.string().optional(),
  STORAGE_BUCKET: z.string().optional(),
  STORAGE_ACCESS_KEY_ID: z.string().optional(),
  STORAGE_SECRET_ACCESS_KEY: z.string().optional(),
  STORAGE_PUBLIC_URL: z.url().optional(),
  MAX_IMAGES_PER_LISTING: z.coerce.number().int().positive().default(30),
  MAX_IMAGE_SIZE_MB: z.coerce.number().int().positive().default(10),

  // Phase 4 (deferred, feature-flagged OFF by owner decision) — SMS/OTP
  FEATURE_OTP_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  SMS_PROVIDER_API_KEY: z.string().optional(),

  // Phase 7 — payments (provider selected by client: telr | ni | stripe)
  PAYMENT_PROVIDER: z.enum(["sandbox", "telr", "ni", "stripe"]).default("sandbox"),
  PAYMENT_PROVIDER_API_KEY: z.string().optional(),
  PAYMENT_PROVIDER_WEBHOOK_SECRET: z.string().optional(),

  // Monitoring (pre-production)
  SENTRY_DSN: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:\n" +
      JSON.stringify(z.treeifyError(parsed.error), null, 2),
  );
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;
