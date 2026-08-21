import { z } from "zod";

export const EVENT_TYPES = [
  "LIVE_CLASS",
  "TRAINING_PROGRAM",
  "WORKSHOP",
  "SEMINAR",
] as const;

export const EVENT_DELIVERY_MODES = ["ONLINE", "OFFLINE", "HYBRID"] as const;

export const EVENT_SKILL_LEVELS = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "ALL_LEVELS",
] as const;

const optionalText = z
  .string()
  .max(4000)
  .optional()
  .transform((value) => (value ? value : undefined));

const optionalDatetimeLocal = z
  .string()
  .optional()
  .transform((value) => (value ? new Date(value) : undefined));

export const eventSchema = z
  .object({
    title: z.string().min(3).max(160),
    shortDescription: z.string().min(10).max(300),
    description: z.string().min(20).max(10000),
    type: z.enum(EVENT_TYPES),
    categoryId: z.string().min(1, "Category is required"),
    instructorId: z.string().min(1, "Instructor is required"),
    thumbnailUrl: z
      .url()
      .optional()
      .or(z.literal(""))
      .transform((value) => (value ? value : undefined)),
    learningObjectives: optionalText,
    targetAudience: optionalText,
    prerequisites: optionalText,
    language: z.string().min(2).max(40).default("English"),
    capacity: z
      .string()
      .optional()
      .transform((value) => (value ? Number(value) : undefined)),
    priceBdt: z.coerce.number().int().min(0),
    compareAtPriceBdt: z
      .string()
      .optional()
      .transform((value) => (value ? Number(value) : undefined)),
    registrationOpensAt: optionalDatetimeLocal,
    registrationClosesAt: optionalDatetimeLocal,
    startAt: z.string().transform((value) => new Date(value)),
    endAt: z.string().transform((value) => new Date(value)),
    featured: z
      .union([z.literal("on"), z.literal("true")])
      .optional()
      .transform((value) => value !== undefined),
    termsAndRefundPolicy: optionalText,
    classSchedule: optionalText,
    minAttendanceSessions: z
      .string()
      .optional()
      .transform((value) => (value ? Number(value) : undefined)),
    deliveryMode: z.enum(EVENT_DELIVERY_MODES).default("ONLINE"),
    location: z
      .string()
      .max(255)
      .optional()
      .transform((value) => (value ? value : undefined)),
    skillLevel: z.enum(EVENT_SKILL_LEVELS).default("ALL_LEVELS"),
    promoVideoUrl: z
      .url()
      .optional()
      .or(z.literal(""))
      .transform((value) => (value ? value : undefined)),
  })
  .refine((data) => data.endAt > data.startAt, {
    message: "Event end time must be after the start time.",
    path: ["endAt"],
  })
  .refine(
    (data) => data.deliveryMode === "ONLINE" || !!data.location,
    {
      message: "Location is required for offline or hybrid Events.",
      path: ["location"],
    },
  )
  .refine((data) => data.capacity === undefined || data.capacity > 0, {
    message: "Capacity must be greater than zero when limited.",
    path: ["capacity"],
  })
  .refine(
    (data) => data.compareAtPriceBdt === undefined || data.compareAtPriceBdt > data.priceBdt,
    {
      message: "Regular price must be higher than the actual price when set.",
      path: ["compareAtPriceBdt"],
    },
  )
  .refine((data) => data.minAttendanceSessions === undefined || data.minAttendanceSessions > 0, {
    message: "Minimum attendance must be greater than zero when set.",
    path: ["minAttendanceSessions"],
  })
  .refine(
    (data) =>
      !data.registrationClosesAt || data.registrationClosesAt <= data.startAt,
    {
      message: "Registration must close on or before the Event starts.",
      path: ["registrationClosesAt"],
    },
  );

export type EventInput = z.infer<typeof eventSchema>;
