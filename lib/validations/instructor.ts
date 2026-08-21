import { z } from "zod";

export const instructorSchema = z.object({
  name: z.string().min(2).max(100),
  // Login email — also stored as the instructor's public contact email.
  email: z.string().email().max(150),
  password: z.string().min(8).max(72),
  title: z.string().max(120).optional(),
  bio: z.string().max(4000).optional(),
  avatarUrl: z.string().url().max(500).optional(),
  company: z.string().max(120).optional(),
  phone: z.string().max(30).optional(),
  website: z.string().url().max(255).optional(),
  twitterUrl: z.string().url().max(255).optional(),
  linkedinUrl: z.string().url().max(255).optional(),
  githubUrl: z.string().url().max(255).optional(),
});

export type InstructorInput = z.infer<typeof instructorSchema>;

// Self-service profile edit (docs/instactor.md §2 "Instructor Profile") —
// no email/password here; those are login credentials, changed via the
// existing account-settings/reset-password flow, not this form.
export const instructorProfileSchema = instructorSchema.omit({ email: true, password: true });

export type InstructorProfileInput = z.infer<typeof instructorProfileSchema>;
