import { z } from "zod";

export const INSTRUCTOR_PAYOUT_METHODS = [
  "CASH",
  "BANK_TRANSFER",
  "MOBILE_BANKING",
  "BKASH",
  "NAGAD",
  "ROCKET",
  "OTHER",
] as const;

export const recordInstructorPaymentSchema = z.object({
  amountBdt: z.coerce.number().int().positive("Enter a payment amount greater than 0."),
  paymentDate: z.string().min(1, "Pick a payment date."),
  method: z.enum(INSTRUCTOR_PAYOUT_METHODS),
  // Every manual payment requires a transaction/reference number (docs/Payment.md).
  referenceNumber: z.string().trim().min(2, "Enter a transaction/reference number.").max(100),
  note: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
});

export type RecordInstructorPaymentInput = z.infer<typeof recordInstructorPaymentSchema>;

export const reverseInstructorPaymentSchema = z.object({
  reason: z.string().trim().min(5, "Explain why this payment is being reversed.").max(500),
});
