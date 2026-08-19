import { z } from "zod";

export const DISCOUNT_TYPES = ["PERCENTAGE", "FIXED"] as const;

const optionalDatetimeLocal = z
  .string()
  .optional()
  .transform((value) => (value ? new Date(value) : undefined));

const optionalInt = z
  .string()
  .optional()
  .transform((value) => (value ? Number(value) : undefined));

export const discountSchema = z
  .object({
    code: z
      .string()
      .min(3)
      .max(40)
      .transform((value) => value.toUpperCase().trim()),
    type: z.enum(DISCOUNT_TYPES),
    amount: z.coerce.number().int().min(1),
    startsAt: optionalDatetimeLocal,
    expiresAt: optionalDatetimeLocal,
    maxTotalUsage: optionalInt,
    maxPerUserUsage: optionalInt,
    minPurchaseBdt: z.coerce.number().int().min(0).default(0),
    maxDiscountBdt: optionalInt,
  })
  .refine((data) => data.type !== "PERCENTAGE" || data.amount <= 100, {
    message: "A percentage discount can't exceed 100.",
    path: ["amount"],
  });

export type DiscountInput = z.infer<typeof discountSchema>;
