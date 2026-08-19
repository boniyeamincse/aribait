"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/permissions";
import { writeAuditLog } from "@/lib/audit/log";

const STATUSES = ["PRESENT", "ABSENT", "LATE", "EXCUSED"] as const;
type Status = (typeof STATUSES)[number];

export async function markAttendance(
  registrationId: string,
  eventSessionId: string,
  status: Status,
) {
  const admin = await requireAdmin();

  if (!STATUSES.includes(status)) {
    return { ok: false as const, error: "Invalid status." };
  }

  await prisma.sessionAttendance.upsert({
    where: {
      registrationId_eventSessionId: { registrationId, eventSessionId },
    },
    update: { status, markedById: admin.id, markedAt: new Date() },
    create: {
      registrationId,
      eventSessionId,
      status,
      markedById: admin.id,
      markedAt: new Date(),
    },
  });

  await writeAuditLog({
    actorId: admin.id,
    action: "attendance.mark",
    targetType: "SessionAttendance",
    targetId: `${registrationId}:${eventSessionId}`,
    summary: `Marked registration ${registrationId} as ${status} for session ${eventSessionId}`,
  });

  revalidatePath(`/admin/attendance/${eventSessionId}`);
  return { ok: true as const };
}

export async function markAllPresent(eventSessionId: string) {
  const admin = await requireAdmin();

  const session = await prisma.eventSession.findUnique({ where: { id: eventSessionId } });
  if (!session) {
    return { ok: false as const, error: "Session not found." };
  }

  const registrations = await prisma.registration.findMany({
    where: { eventId: session.eventId, status: "CONFIRMED" },
    select: { id: true },
  });

  await prisma.$transaction(
    registrations.map((r) =>
      prisma.sessionAttendance.upsert({
        where: { registrationId_eventSessionId: { registrationId: r.id, eventSessionId } },
        update: { status: "PRESENT", markedById: admin.id, markedAt: new Date() },
        create: {
          registrationId: r.id,
          eventSessionId,
          status: "PRESENT",
          markedById: admin.id,
          markedAt: new Date(),
        },
      }),
    ),
  );

  await writeAuditLog({
    actorId: admin.id,
    action: "attendance.mark_all_present",
    targetType: "EventSession",
    targetId: eventSessionId,
    summary: `Marked all ${registrations.length} confirmed registration(s) present for session ${eventSessionId}`,
  });

  revalidatePath(`/admin/attendance/${eventSessionId}`);
  return { ok: true as const };
}
