import { eventSessionSchema } from "@/lib/validations/event-session";
import { encryptSecret } from "@/lib/security/crypto";

export function parseSessionForm(formData: FormData) {
  return eventSessionSchema.safeParse({
    title: formData.get("title"),
    sequence: formData.get("sequence"),
    description: formData.get("description") ?? undefined,
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
    timeZone: formData.get("timeZone") || "Asia/Dhaka",
    hostInstructorId: formData.get("hostInstructorId") ?? undefined,
    platform: formData.get("platform"),
    meetingId: formData.get("meetingId") ?? undefined,
    meetingUrl: formData.get("meetingUrl") ?? "",
    meetingPasscode: formData.get("meetingPasscode") ?? undefined,
  });
}

/** Encrypts meetingUrl/meetingPasscode when provided; leaves them out of the
 * returned object (Prisma treats an omitted/undefined key as "don't change
 * this field") when left blank, so an edit never wipes a previously-set
 * secret and never needs to display it back. */
export function encryptSessionSecrets<T extends { meetingUrl?: string; meetingPasscode?: string }>(
  data: T,
) {
  return {
    ...data,
    meetingUrl: data.meetingUrl ? encryptSecret(data.meetingUrl) : undefined,
    meetingPasscode: data.meetingPasscode
      ? encryptSecret(data.meetingPasscode)
      : undefined,
  };
}
