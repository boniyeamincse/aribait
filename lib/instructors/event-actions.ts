"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db/client";
import { requireInstructor } from "@/lib/permissions";
import { requireOwnedEvent } from "@/lib/instructors/ownership";
import { isEligibleToCreateEvents, INELIGIBLE_MESSAGE } from "@/lib/instructors/eligibility";
import { eventSchema } from "@/lib/validations/event";
import { uniqueEventSlug } from "@/lib/events/actions";
import { sendNotificationToMany } from "@/lib/notifications";
import { writeAuditLog } from "@/lib/audit/log";

type ActionResult = { ok: true } | { ok: false; error: string };

function parseEventForm(formData: FormData, instructorId: string) {
  return eventSchema.safeParse({
    title: formData.get("title"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    type: formData.get("type"),
    categoryId: formData.get("categoryId"),
    instructorId,
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
    featured: undefined, // instructors cannot self-feature
    termsAndRefundPolicy: formData.get("termsAndRefundPolicy") ?? undefined,
    classSchedule: formData.get("classSchedule") ?? undefined,
    minAttendanceSessions: formData.get("minAttendanceSessions") ?? undefined,
    deliveryMode: formData.get("deliveryMode") ?? undefined,
    location: formData.get("location") ?? undefined,
    skillLevel: formData.get("skillLevel") ?? undefined,
    promoVideoUrl: formData.get("promoVideoUrl") ?? "",
  });
}

export async function createInstructorEvent(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { user, instructor } = await requireInstructor();

  const parsed = parseEventForm(formData, instructor.id);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the form for errors.",
    };
  }

  const slug = await uniqueEventSlug(parsed.data.title);
  const event = await prisma.event.create({
    data: { ...parsed.data, slug, status: "DRAFT", createdById: user.id },
  });

  await writeAuditLog({
    actorId: user.id,
    action: "event.create",
    targetType: "Event",
    targetId: event.id,
    summary: `Instructor created Event "${event.title}" (DRAFT)`,
  });

  revalidatePath("/instructor/events");
  redirect(`/instructor/events/${event.id}`);
}

export async function updateInstructorEvent(
  eventId: string,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { instructor, event: current } = await requireOwnedEvent(eventId);

  if (current.status !== "DRAFT" && current.status !== "CHANGES_REQUESTED") {
    return { ok: false, error: "This Event can't be edited in its current status." };
  }

  const parsed = parseEventForm(formData, instructor.id);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the form for errors.",
    };
  }

  await prisma.event.update({ where: { id: eventId }, data: parsed.data });

  revalidatePath(`/instructor/events/${eventId}`);
  revalidatePath("/instructor/events");
  return { ok: true };
}

export async function deleteInstructorEvent(eventId: string) {
  const { event } = await requireOwnedEvent(eventId);
  if (event.status !== "DRAFT") {
    return { ok: false, error: "Only Draft Events can be deleted." } satisfies ActionResult;
  }
  await prisma.event.delete({ where: { id: eventId } });
  revalidatePath("/instructor/events");
  redirect("/instructor/events");
}

/** Runs the docs/instactor.md §7 submission checklist, then moves the Event
 * from DRAFT/CHANGES_REQUESTED into the admin approval queue. */
export async function submitEventForApproval(eventId: string): Promise<ActionResult> {
  const { user, instructor, event } = await requireOwnedEvent(eventId);

  if (!isEligibleToCreateEvents(user, instructor)) {
    return { ok: false, error: INELIGIBLE_MESSAGE };
  }
  if (event.status !== "DRAFT" && event.status !== "CHANGES_REQUESTED") {
    return { ok: false, error: "This Event has already been submitted." };
  }

  const missing: string[] = [];
  if (!event.thumbnailUrl) missing.push("a cover image");
  if (!event.learningObjectives) missing.push("learning objectives");
  if (!event.targetAudience) missing.push("the intended audience");
  if (event.capacity === null || event.capacity <= 0) {
    missing.push("a participant capacity greater than zero");
  }
  if (event.deliveryMode !== "ONLINE" && !event.location) {
    missing.push("a location for the offline/hybrid Event");
  }

  const sessions = await prisma.eventSession.findMany({
    where: { eventId, status: { not: "CANCELLED" } },
    orderBy: { startAt: "asc" },
  });
  if (sessions.length === 0) {
    missing.push("at least one Session");
  } else if (
    event.registrationClosesAt &&
    event.registrationClosesAt > sessions[0].startAt
  ) {
    missing.push("a registration deadline before the first Session");
  }

  if (missing.length > 0) {
    return { ok: false, error: `Before submitting, add: ${missing.join(", ")}.` };
  }

  await prisma.event.update({
    where: { id: eventId },
    data: { status: "PENDING_APPROVAL", submittedAt: new Date() },
  });

  await writeAuditLog({
    actorId: user.id,
    action: "event.submit",
    targetType: "Event",
    targetId: eventId,
    summary: `Instructor submitted "${event.title}" for approval`,
  });

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });
  await sendNotificationToMany(
    admins.map((a) => a.id),
    (userId) => ({
      userId,
      type: "EVENT_SUBMITTED",
      title: `Event submitted for approval: ${event.title}`,
      body: `${instructor.name} submitted "${event.title}" for approval.`,
      eventId,
    }),
  );

  revalidatePath(`/instructor/events/${eventId}`);
  revalidatePath("/instructor/events");
  revalidatePath("/admin/events");
  return { ok: true };
}
