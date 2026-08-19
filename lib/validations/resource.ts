import { z } from "zod";

export const eventResourceSchema = z.object({
  title: z.string().min(2).max(160),
  url: z.url(),
});

export type EventResourceInput = z.infer<typeof eventResourceSchema>;
