import { z } from "zod";

export const SESSION_PLATFORMS = [
  "ZOOM",
  "GOOGLE_MEET",
  "MICROSOFT_TEAMS",
  "CUSTOM",
] as const;

export const eventSessionSchema = z
  .object({
    title: z.string().min(3).max(160),
    sequence: z.coerce.number().int().min(1),
    description: z
      .string()
      .max(4000)
      .optional()
      .transform((value) => (value ? value : undefined)),
    startAt: z.string().transform((value) => new Date(value)),
    endAt: z.string().transform((value) => new Date(value)),
    timeZone: z.string().min(2).max(60).default("Asia/Dhaka"),
    hostInstructorId: z.string().min(1, "Host instructor is required"),
    platform: z.enum(SESSION_PLATFORMS),
    meetingId: z
      .string()
      .max(200)
      .optional()
      .transform((value) => (value ? value : undefined)),
    meetingUrl: z
      .url()
      .optional()
      .or(z.literal(""))
      .transform((value) => (value ? value : undefined)),
    meetingPasscode: z
      .string()
      .max(100)
      .optional()
      .transform((value) => (value ? value : undefined)),
  })
  .refine((data) => data.endAt > data.startAt, {
    message: "Session end time must be after the start time.",
    path: ["endAt"],
  });

export type EventSessionInput = z.infer<typeof eventSessionSchema>;
