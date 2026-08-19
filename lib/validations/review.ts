import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z
    .string()
    .max(2000)
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
