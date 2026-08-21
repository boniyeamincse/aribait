"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/client";
import { requireInstructor } from "@/lib/permissions";
import { writeAuditLog } from "@/lib/audit/log";

const STATUSES = ["PRESENT", "ABSENT", "LATE", "EXCUSED"] as const;
type Status = (typeof STATUSES)[number];

async function requireOwnedSession(eventSessionId: string) {
  const { user, instructor } = await requireInstructor();
  const session = await prisma.eventSession.findUnique({
    where: { id: eventSessionId },
    include: { event: true },
  });
  if (!session || session.event.instructorId !== instructor.id) {
    return { ok: false as const, error: "Session not found." };
  }
  return { ok: true as const, user, session };
}

export async function markInstructorAttendance(
  registrationId: string,
  eventSessionId: string,
  status: Status,
) {
  const owned = await requireOwnedSession(eventSessionId);
  if (!owned.ok) return owned;

  if (!STATUSES.includes(status)) {
    return { ok: false as const, error: "Invalid status." };
  }

  await prisma.sessionAttendance.upsert({
    where: { registrationId_eventSessionId: { registrationId, eventSessionId } },
    update: { status, markedById: owned.user.id, markedAt: new Date() },
    create: {
      registrationId,
      eventSessionId,
      status,
      markedById: owned.user.id,
      markedAt: new Date(),
    },
  });

  await writeAuditLog({
    actorId: owned.user.id,
    action: "attendance.mark",
    targetType: "SessionAttendance",
    targetId: `${registrationId}:${eventSessionId}`,
    summary: `Instructor marked registration ${registrationId} as ${status} for session ${eventSessionId}`,
  });

  revalidatePath(`/instructor/events/${owned.session.eventId}`);
  return { ok: true as const };
}

export async function markAllInstructorPresent(eventSessionId: string) {
  const owned = await requireOwnedSession(eventSessionId);
  if (!owned.ok) return owned;

  const registrations = await prisma.registration.findMany({
    where: { eventId: owned.session.eventId, status: "CONFIRMED" },
    select: { id: true },
  });

  await prisma.$transaction(
    registrations.map((r) =>
      prisma.sessionAttendance.upsert({
        where: { registrationId_eventSessionId: { registrationId: r.id, eventSessionId } },
        update: { status: "PRESENT", markedById: owned.user.id, markedAt: new Date() },
        create: {
          registrationId: r.id,
          eventSessionId,
          status: "PRESENT",
          markedById: owned.user.id,
          markedAt: new Date(),
        },
      }),
    ),
  );

  await writeAuditLog({
    actorId: owned.user.id,
    action: "attendance.mark_all_present",
    targetType: "EventSession",
    targetId: eventSessionId,
    summary: `Instructor marked all ${registrations.length} confirmed registration(s) present for session ${eventSessionId}`,
  });

  revalidatePath(`/instructor/events/${owned.session.eventId}`);
  return { ok: true as const };
}
