"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/client";
import { requireOwnedEvent } from "@/lib/instructors/ownership";
import { parseSessionForm, encryptSessionSecrets } from "@/lib/events/session-actions";
import { validateSessionSchedule } from "@/lib/events/session-validation";
import { writeAuditLog } from "@/lib/audit/log";

type ActionResult = { ok: true } | { ok: false; error: string };

const EDITABLE_STATUSES = ["DRAFT", "CHANGES_REQUESTED"] as const;

export async function createInstructorEventSession(
  eventId: string,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { user, event } = await requireOwnedEvent(eventId);

  if (!EDITABLE_STATUSES.includes(event.status as (typeof EDITABLE_STATUSES)[number])) {
    return { ok: false, error: "Sessions can only be added while the Event is a Draft." };
  }

  const parsed = parseSessionForm(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the session form." };
  }

  const existing = await prisma.eventSession.findUnique({
    where: { eventId_sequence: { eventId, sequence: parsed.data.sequence } },
  });
  if (existing) {
    return { ok: false, error: `Session ${parsed.data.sequence} already exists for this Event.` };
  }

  const scheduleError = await validateSessionSchedule({
    eventId,
    hostInstructorId: parsed.data.hostInstructorId,
    startAt: parsed.data.startAt,
    endAt: parsed.data.endAt,
  });
  if (scheduleError) {
    return { ok: false, error: scheduleError };
  }

  const session = await prisma.eventSession.create({
    data: { ...encryptSessionSecrets(parsed.data), eventId },
  });

  await writeAuditLog({
    actorId: user.id,
    action: "session.create",
    targetType: "EventSession",
    targetId: session.id,
    summary: `Instructor created Session "${session.title}" (#${session.sequence})`,
  });

  revalidatePath(`/instructor/events/${eventId}`);
  return { ok: true };
}

export async function updateInstructorEventSession(
  sessionId: string,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const current = await prisma.eventSession.findUniqueOrThrow({ where: { id: sessionId } });
  const { user, event } = await requireOwnedEvent(current.eventId);

  if (!EDITABLE_STATUSES.includes(event.status as (typeof EDITABLE_STATUSES)[number])) {
    return { ok: false, error: "Sessions can only be edited while the Event is a Draft." };
  }

  const parsed = parseSessionForm(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the session form." };
  }

  const scheduleError = await validateSessionSchedule({
    eventId: current.eventId,
    hostInstructorId: parsed.data.hostInstructorId,
    startAt: parsed.data.startAt,
    endAt: parsed.data.endAt,
    excludeSessionId: sessionId,
  });
  if (scheduleError) {
    return { ok: false, error: scheduleError };
  }

  const session = await prisma.eventSession.update({
    where: { id: sessionId },
    data: encryptSessionSecrets(parsed.data),
  });

  await writeAuditLog({
    actorId: user.id,
    action: "session.update",
    targetType: "EventSession",
    targetId: sessionId,
    summary: `Instructor updated Session "${session.title}"`,
  });

  revalidatePath(`/instructor/events/${current.eventId}`);
  return { ok: true };
}
