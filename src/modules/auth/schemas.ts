import { z } from "zod";

const phoneE164 = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/, "Phone must be E.164 (e.g. +971501234567)");

export const registerSchema = z
  .object({
    displayName: z.string().trim().min(2).max(80),
    accountType: z.enum(["individual", "dealer"]),
    email: z.email().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    password: z.string().min(8).max(128),
    businessName: z.string().trim().min(2).max(120).optional(),
  })
  .superRefine((data, ctx) => {
    const email = data.email?.trim() ?? "";
    const phone = data.phone?.trim() ?? "";
    if (!email && !phone) {
      ctx.addIssue({
        code: "custom",
        message: "Provide an email or a mobile number",
        path: ["email"],
      });
    }
    if (email) {
      const parsed = z.email().safeParse(email);
      if (!parsed.success) {
        ctx.addIssue({
          code: "custom",
          message: "Invalid email",
          path: ["email"],
        });
      }
    }
    if (phone) {
      const parsed = phoneE164.safeParse(phone);
      if (!parsed.success) {
        ctx.addIssue({
          code: "custom",
          message: "Phone must be E.164 (e.g. +971501234567)",
          path: ["phone"],
        });
      }
    }
    if (data.accountType === "dealer" && !data.businessName?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Business name is required for dealers",
        path: ["businessName"],
      });
    }
  });

export const loginSchema = z.object({
  identifier: z.string().trim().min(3).max(120),
  password: z.string().min(1).max(128),
});

export const forgotPasswordSchema = z.object({
  email: z.email(),
});

export const resetPasswordSchema = z.object({
  email: z.email(),
  token: z.string().min(20),
  password: z.string().min(8).max(128),
});

export const verifyEmailSchema = z.object({
  email: z.email(),
  token: z.string().min(20),
});
