"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/permissions";
import { eventSessionSchema } from "@/lib/validations/event-session";

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

export async function createEventSession(
  eventId: string,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

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

  await prisma.eventSession.create({
    data: { ...parsed.data, eventId },
  });
  revalidatePath(`/admin/events/${eventId}`);
  return { ok: true };
}

export async function updateEventSession(
  sessionId: string,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = parseSessionForm(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the session form.",
    };
  }

  const current = await prisma.eventSession.findUniqueOrThrow({
    where: { id: sessionId },
  });
  const timingChanged =
    current.startAt.getTime() !== parsed.data.startAt.getTime() ||
    current.endAt.getTime() !== parsed.data.endAt.getTime();

  const session = await prisma.eventSession.update({
    where: { id: sessionId },
    data: {
      ...parsed.data,
      status: timingChanged ? "RESCHEDULED" : current.status,
    },
  });
  revalidatePath(`/admin/events/${session.eventId}`);
  return { ok: true };
}

export async function cancelEventSession(sessionId: string) {
  await requireAdmin();
  const session = await prisma.eventSession.update({
    where: { id: sessionId },
    data: { status: "CANCELLED" },
  });
  revalidatePath(`/admin/events/${session.eventId}`);
}
