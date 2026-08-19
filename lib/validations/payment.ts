import { z } from "zod";

export const PAYMENT_METHODS = ["BKASH", "NAGAD"] as const;

export const paymentProofSchema = z.object({
  method: z.enum(PAYMENT_METHODS),
  senderMsisdn: z
    .string()
    .trim()
    .regex(/^01[0-9]{9}$/, "Enter a valid Bangladeshi mobile number (01XXXXXXXXX)."),
  trxId: z
    .string()
    .trim()
    .min(6, "Enter the TrxID from your bKash/Nagad confirmation SMS.")
    .max(50),
  proofImageUrl: z
    .url()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
});

export type PaymentProofInput = z.infer<typeof paymentProofSchema>;

export const rejectPaymentSchema = z.object({
  reason: z.string().min(5, "Explain why this proof is being rejected.").max(500),
});
