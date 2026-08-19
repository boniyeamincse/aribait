import { z } from "zod";

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
});
