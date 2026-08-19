import { z } from "zod";

export const announcementSchema = z.object({
  title: z.string().min(3).max(160),
  body: z.string().min(5).max(2000),
});

export type AnnouncementInput = z.infer<typeof announcementSchema>;
