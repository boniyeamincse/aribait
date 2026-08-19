"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/permissions";
import { eventSessionSchema } from "@/lib/validations/event-session";
import { encryptSecret } from "@/lib/security/crypto";
import { sendNotification } from "@/lib/notifications";
import { writeAuditLog } from "@/lib/audit/log";

type ActionResult = { ok: true } | { ok: false; error: string };

function parseSessionForm(formData: FormData) {
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
function encryptSessionSecrets<T extends { meetingUrl?: string; meetingPasscode?: string }>(
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

async function notifyConfirmedRegistrants(
  eventId: string,
  build: (userId: string) => Parameters<typeof sendNotification>[0],
) {
  const registrations = await prisma.registration.findMany({
    where: { eventId, status: "CONFIRMED" },
    select: { userId: true },
  });
  for (const registration of registrations) {
    await sendNotification(build(registration.userId));
  }
}

export async function createEventSession(
  eventId: string,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const parsed = parseSessionForm(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the session form.",
    };
  }

  const existing = await prisma.eventSession.findUnique({
    where: { eventId_sequence: { eventId, sequence: parsed.data.sequence } },
  });
  if (existing) {
    return {
      ok: false,
      error: `Session ${parsed.data.sequence} already exists for this Event.`,
    };
  }

  const session = await prisma.eventSession.create({
    data: { ...encryptSessionSecrets(parsed.data), eventId },
  });
  await writeAuditLog({
    actorId: admin.id,
    action: "session.create",
    targetType: "EventSession",
    targetId: session.id,
    summary: `Created Session "${session.title}" (#${session.sequence})${parsed.data.meetingUrl ? " with a meeting link" : ""}`,
  });
  revalidatePath(`/admin/events/${eventId}`);
  return { ok: true };
}

export async function updateEventSession(
  sessionId: string,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const parsed = parseSessionForm(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the session form.",
    };
  }

  const current = await prisma.eventSession.findUniqueOrThrow({
    where: { id: sessionId },
    include: { event: true },
  });
  // datetime-local inputs only carry minute precision, so compare at that
  // granularity — otherwise every save re-triggers "RESCHEDULED" purely
  // from losing the stored seconds/ms in the round trip.
  const toMinute = (date: Date) => Math.floor(date.getTime() / 60_000);
  const timingChanged =
    toMinute(current.startAt) !== toMinute(parsed.data.startAt) ||
    toMinute(current.endAt) !== toMinute(parsed.data.endAt);

  const session = await prisma.eventSession.update({
    where: { id: sessionId },
    data: {
      ...encryptSessionSecrets(parsed.data),
      status: timingChanged ? "RESCHEDULED" : current.status,
    },
  });

  const meetingLinkChanged = Boolean(parsed.data.meetingUrl || parsed.data.meetingPasscode);
  if (timingChanged || meetingLinkChanged) {
    const changes = [
      timingChanged && "timing",
      meetingLinkChanged && "meeting link/passcode",
    ]
      .filter(Boolean)
      .join(", ");
    await writeAuditLog({
      actorId: admin.id,
      action: "session.update",
      targetType: "EventSession",
      targetId: sessionId,
      summary: `Updated Session "${session.title}": ${changes}`,
    });
  }

  if (timingChanged) {
    // Old reminders were correct for the old time; delete them so the
    // reminders cron can fire a fresh one 20 minutes before the new time
    // instead of staying blocked by the stale row.
    await prisma.notification.deleteMany({
      where: { eventSessionId: sessionId, type: "SESSION_REMINDER" },
    });

    await notifyConfirmedRegistrants(current.eventId, (userId) => ({
      userId,
      type: "SESSION_RESCHEDULED",
      title: `Session rescheduled: ${session.title}`,
      body: `${current.event.title} — "${session.title}" is now scheduled for ${session.startAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}.`,
      eventId: current.eventId,
      eventSessionId: sessionId,
      email: {
        subject: `Session rescheduled: ${session.title}`,
        text: `${current.event.title} — "${session.title}" is now scheduled for ${session.startAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}.`,
      },
    }));
  }

  revalidatePath(`/admin/events/${session.eventId}`);
  return { ok: true };
}

export async function cancelEventSession(sessionId: string) {
  const admin = await requireAdmin();
  const session = await prisma.eventSession.update({
    where: { id: sessionId },
    data: { status: "CANCELLED" },
    include: { event: true },
  });
  await writeAuditLog({
    actorId: admin.id,
    action: "session.cancel",
    targetType: "EventSession",
    targetId: sessionId,
    summary: `Cancelled Session "${session.title}"`,
  });

  await prisma.notification.deleteMany({
    where: { eventSessionId: sessionId, type: "SESSION_REMINDER" },
  });

  await notifyConfirmedRegistrants(session.eventId, (userId) => ({
    userId,
    type: "SESSION_CANCELLED",
    title: `Session cancelled: ${session.title}`,
    body: `${session.event.title} — "${session.title}" has been cancelled.`,
    eventId: session.eventId,
    eventSessionId: sessionId,
    email: {
      subject: `Session cancelled: ${session.title}`,
      text: `${session.event.title} — "${session.title}" has been cancelled.`,
    },
  }));

  revalidatePath(`/admin/events/${session.eventId}`);
}
