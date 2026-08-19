"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/permissions";
import { eventSchema } from "@/lib/validations/event";
import { announcementSchema } from "@/lib/validations/announcement";
import { slugify } from "@/lib/utils";
import { sendNotification } from "@/lib/notifications";
import { writeAuditLog } from "@/lib/audit/log";

type ActionResult = { ok: true } | { ok: false; error: string };

async function notifyRegistrants(
  eventId: string,
  statuses: ("CONFIRMED" | "WAITLISTED")[],
  build: (userId: string) => Parameters<typeof sendNotification>[0],
) {
  const registrations = await prisma.registration.findMany({
    where: { eventId, status: { in: statuses } },
    select: { userId: true },
  });
  for (const registration of registrations) {
    await sendNotification(build(registration.userId));
  }
}

async function uniqueEventSlug(title: string) {
  const base = slugify(title);
  let slug = base;
  let suffix = 2;
  while (await prisma.event.findUnique({ where: { slug } })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

function parseEventForm(formData: FormData) {
  return eventSchema.safeParse({
    title: formData.get("title"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    type: formData.get("type"),
    categoryId: formData.get("categoryId"),
    instructorId: formData.get("instructorId"),
    thumbnailUrl: formData.get("thumbnailUrl") ?? "",
    learningObjectives: formData.get("learningObjectives") ?? undefined,
    targetAudience: formData.get("targetAudience") ?? undefined,
    prerequisites: formData.get("prerequisites") ?? undefined,
    language: formData.get("language") || "English",
    capacity: formData.get("capacity") ?? undefined,
    priceBdt: formData.get("priceBdt") ?? "0",
    compareAtPriceBdt: formData.get("compareAtPriceBdt") ?? undefined,
    registrationOpensAt: formData.get("registrationOpensAt") ?? undefined,
    registrationClosesAt: formData.get("registrationClosesAt") ?? undefined,
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
    featured: formData.get("featured") ?? undefined,
    termsAndRefundPolicy: formData.get("termsAndRefundPolicy") ?? undefined,
    classSchedule: formData.get("classSchedule") ?? undefined,
    minAttendanceSessions: formData.get("minAttendanceSessions") ?? undefined,
  });
}

export async function createEvent(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const parsed = parseEventForm(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the form for errors.",
    };
  }

  const slug = await uniqueEventSlug(parsed.data.title);
  const event = await prisma.event.create({
    data: { ...parsed.data, slug },
  });

  await writeAuditLog({
    actorId: admin.id,
    action: "event.create",
    targetType: "Event",
    targetId: event.id,
    summary: `Created Event "${event.title}" (${event.status})`,
  });

  revalidatePath("/admin/events");
  redirect(`/admin/events/${event.id}`);
}

export async function updateEvent(
  eventId: string,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const parsed = parseEventForm(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the form for errors.",
    };
  }

  const current = await prisma.event.findUniqueOrThrow({ where: { id: eventId } });
  await prisma.event.update({ where: { id: eventId }, data: parsed.data });

  const changes: string[] = [];
  if (current.priceBdt !== parsed.data.priceBdt) {
    changes.push(`price ${current.priceBdt} → ${parsed.data.priceBdt}`);
  }
  if (current.capacity !== parsed.data.capacity) {
    changes.push(`capacity ${current.capacity ?? "unlimited"} → ${parsed.data.capacity ?? "unlimited"}`);
  }
  if (current.startAt.getTime() !== parsed.data.startAt.getTime()) {
    changes.push("start time changed");
  }
  if (current.endAt.getTime() !== parsed.data.endAt.getTime()) {
    changes.push("end time changed");
  }
  if (changes.length > 0) {
    await writeAuditLog({
      actorId: admin.id,
      action: "event.update",
      targetType: "Event",
      targetId: eventId,
      summary: `Updated "${current.title}": ${changes.join(", ")}`,
    });
  }

  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/events");
  return { ok: true };
}

export async function publishEvent(eventId: string) {
  const admin = await requireAdmin();
  const event = await prisma.event.update({
    where: { id: eventId },
    data: { status: "PUBLISHED" },
  });
  await writeAuditLog({
    actorId: admin.id,
    action: "event.publish",
    targetType: "Event",
    targetId: eventId,
    summary: `Published "${event.title}"`,
  });
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/events");
  revalidatePath("/events");
}

export async function cancelEvent(eventId: string) {
  const admin = await requireAdmin();
  const event = await prisma.event.update({
    where: { id: eventId },
    data: { status: "CANCELLED" },
  });
  await writeAuditLog({
    actorId: admin.id,
    action: "event.cancel",
    targetType: "Event",
    targetId: eventId,
    summary: `Cancelled "${event.title}"`,
  });

  await notifyRegistrants(eventId, ["CONFIRMED", "WAITLISTED"], (userId) => ({
    userId,
    type: "EVENT_CANCELLED",
    title: `Event cancelled: ${event.title}`,
    body: `${event.title} has been cancelled. Check your Payments page if a refund applies.`,
    eventId,
    email: {
      subject: `Event cancelled: ${event.title}`,
      text: `${event.title} has been cancelled. Check your Payments page if a refund applies.`,
    },
  }));

  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/events");
  revalidatePath("/events");
}

export async function archiveEvent(eventId: string) {
  const admin = await requireAdmin();
  const event = await prisma.event.update({
    where: { id: eventId },
    data: { status: "ARCHIVED" },
  });
  await writeAuditLog({
    actorId: admin.id,
    action: "event.archive",
    targetType: "Event",
    targetId: eventId,
    summary: `Archived "${event.title}"`,
  });
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/events");
  revalidatePath("/events");
}

// Admin-triggered after reviewing attendance for all required Sessions
// (idea.md §6.5). Certificate issuance is a separate admin action.
export async function completeEvent(eventId: string) {
  const admin = await requireAdmin();
  const event = await prisma.event.update({
    where: { id: eventId },
    data: { status: "COMPLETED" },
  });
  await writeAuditLog({
    actorId: admin.id,
    action: "event.complete",
    targetType: "Event",
    targetId: eventId,
    summary: `Marked "${event.title}" completed`,
  });

  const registrations = await prisma.registration.findMany({
    where: { eventId, status: "CONFIRMED" },
    select: { id: true, userId: true },
  });
  await prisma.registration.updateMany({
    where: { id: { in: registrations.map((r) => r.id) } },
    data: { status: "COMPLETED" },
  });

  for (const registration of registrations) {
    await sendNotification({
      userId: registration.userId,
      type: "EVENT_COMPLETED",
      title: `Event completed: ${event.title}`,
      body: `You've completed ${event.title}. Thanks for learning with Ariba IT!`,
      eventId,
      email: {
        subject: `You completed ${event.title}`,
        text: `You've completed ${event.title}. Thanks for learning with Ariba IT!`,
      },
    });
  }

  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/events");
  revalidatePath("/dashboard/events");
}

export async function sendAnnouncement(
  eventId: string,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = announcementSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the announcement form.",
    };
  }

  const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId } });

  await notifyRegistrants(eventId, ["CONFIRMED", "WAITLISTED"], (userId) => ({
    userId,
    type: "ANNOUNCEMENT",
    title: parsed.data.title,
    body: parsed.data.body,
    eventId,
    email: { subject: `${event.title}: ${parsed.data.title}`, text: parsed.data.body },
  }));

  return { ok: true };
}
