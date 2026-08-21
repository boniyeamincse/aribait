"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/permissions";
import { sendNotification } from "@/lib/notifications";
import { writeAuditLog } from "@/lib/audit/log";

type ActionResult = { ok: true } | { ok: false; error: string };

async function notifyInstructor(
  eventId: string,
  build: (userId: string) => Parameters<typeof sendNotification>[0],
) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { instructor: { select: { userId: true } } },
  });
  if (event?.instructor.userId) {
    await sendNotification(build(event.instructor.userId));
  }
}

/** PENDING_APPROVAL -> APPROVED. Admin still has to publishEvent() separately
 * (docs/instactor.md §6 — APPROVED is "approved but not necessarily published").
 * Plain form action (no useActionState) like publishEvent/cancelEvent — the
 * Approve button only renders while status is PENDING_APPROVAL, so the guard
 * below only matters for a race, and there's no state to report it into. */
export async function approveEvent(eventId: string): Promise<void> {
  const admin = await requireAdmin();

  const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId } });
  if (event.status !== "PENDING_APPROVAL") {
    return;
  }

  await prisma.event.update({
    where: { id: eventId },
    data: { status: "APPROVED", approvedById: admin.id, approvedAt: new Date() },
  });

  await writeAuditLog({
    actorId: admin.id,
    action: "event.approve",
    targetType: "Event",
    targetId: eventId,
    summary: `Approved "${event.title}"`,
  });

  await notifyInstructor(eventId, (userId) => ({
    userId,
    type: "EVENT_APPROVED",
    title: `Event approved: ${event.title}`,
    body: `"${event.title}" has been approved. An admin will publish it shortly.`,
    eventId,
  }));

  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/events");
}

export async function rejectEvent(
  eventId: string,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const reason = formData.get("reason")?.toString().trim();
  if (!reason) {
    return { ok: false, error: "A rejection reason is required." };
  }

  const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId } });
  if (event.status !== "PENDING_APPROVAL") {
    return { ok: false, error: "This Event is not pending approval." };
  }

  await prisma.event.update({
    where: { id: eventId },
    data: { status: "REJECTED", rejectionReason: reason },
  });

  await writeAuditLog({
    actorId: admin.id,
    action: "event.reject",
    targetType: "Event",
    targetId: eventId,
    summary: `Rejected "${event.title}": ${reason}`,
  });

  await notifyInstructor(eventId, (userId) => ({
    userId,
    type: "EVENT_REJECTED",
    title: `Event rejected: ${event.title}`,
    body: `"${event.title}" was rejected: ${reason}`,
    eventId,
  }));

  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/events");
  return { ok: true };
}

export async function requestEventChanges(
  eventId: string,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const note = formData.get("note")?.toString().trim();
  if (!note) {
    return { ok: false, error: "Describe what needs to change." };
  }

  const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId } });
  if (event.status !== "PENDING_APPROVAL") {
    return { ok: false, error: "This Event is not pending approval." };
  }

  await prisma.event.update({
    where: { id: eventId },
    data: { status: "CHANGES_REQUESTED", changeRequestNote: note },
  });

  await writeAuditLog({
    actorId: admin.id,
    action: "event.request_changes",
    targetType: "Event",
    targetId: eventId,
    summary: `Requested changes on "${event.title}": ${note}`,
  });

  await notifyInstructor(eventId, (userId) => ({
    userId,
    type: "EVENT_CHANGES_REQUESTED",
    title: `Changes requested: ${event.title}`,
    body: `Changes were requested on "${event.title}": ${note}`,
    eventId,
  }));

  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/events");
  return { ok: true };
}
