import { z } from "zod";

function optionalText(max: number) {
  return z
    .string()
    .max(max)
    .transform((v) => (v.trim() === "" ? null : v.trim()));
}

function optionalEmail() {
  return z
    .string()
    .max(160)
    .transform((v) => (v.trim() === "" ? null : v.trim()))
    .refine((v) => v === null || z.email().safeParse(v).success, "Enter a valid email address.");
}

function optionalUrl() {
  return z
    .string()
    .max(300)
    .transform((v) => (v.trim() === "" ? null : v.trim()))
    .refine((v) => v === null || z.url().safeParse(v).success, "Enter a valid URL.");
}

export const settingsSchema = z.object({
  siteName: z.string().min(2).max(120),
  defaultTimeZone: z.string().min(2).max(60),
  currency: z.string().min(2).max(10),
  seatHoldMinutes: z.coerce.number().int().min(1).max(180),
  joinWindowBeforeMinutes: z.coerce.number().int().min(0).max(180),
  joinWindowAfterMinutes: z.coerce.number().int().min(0).max(180),
  bkashNagadReceivingMsisdn: z
    .string()
    .regex(/^01[3-9]\d{8}$/, "Enter a valid 11-digit Bangladeshi mobile number."),
  maintenanceMode: z.preprocess((v) => v === "on" || v === true, z.boolean()),
  contactEmail: optionalEmail(),
  contactPhone: optionalText(30),
  facebookUrl: optionalUrl(),
  linkedinUrl: optionalUrl(),
  emailFromName: optionalText(120),
  emailFromAddress: optionalEmail(),
  smtpHost: optionalText(200),
  smtpPort: z.preprocess((v) => (v === "" ? null : Number(v)), z.number().int().min(1).max(65535).nullable()),
  smtpUser: optionalText(200),
  smtpPassword: optionalText(300),
  termsContent: optionalText(20_000),
  privacyContent: optionalText(20_000),
  refundContent: optionalText(20_000),
});
