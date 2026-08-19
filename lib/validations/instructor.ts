import { z } from "zod";

export const instructorSchema = z.object({
  name: z.string().min(2).max(100),
  title: z.string().max(120).optional(),
  bio: z.string().max(4000).optional(),
});

export type InstructorInput = z.infer<typeof instructorSchema>;
