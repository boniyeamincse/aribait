import { prisma } from "@/lib/db/client";

export function getInstructorSessions(instructorId: string) {
  return prisma.eventSession.findMany({
    where: { hostInstructorId: instructorId },
    orderBy: { startAt: "desc" },
    include: { event: { select: { id: true, title: true } } },
  });
}

/** Unique students across every Event this Instructor owns, with a count of
 * how many of those Events each student is (or was) registered for. */
export async function getInstructorStudents(instructorId: string) {
  const registrations = await prisma.registration.findMany({
    where: { event: { instructorId } },
    include: { user: { select: { id: true, name: true, email: true } }, event: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });

  const byUser = new Map<
    string,
    { user: { id: string; name: string | null; email: string }; events: Set<string>; latestStatus: string }
  >();
  for (const r of registrations) {
    const existing = byUser.get(r.user.id);
    if (existing) {
      existing.events.add(r.event.title);
    } else {
      byUser.set(r.user.id, { user: r.user, events: new Set([r.event.title]), latestStatus: r.status });
    }
  }
  return Array.from(byUser.values()).map((v) => ({
    user: v.user,
    eventCount: v.events.size,
    latestStatus: v.latestStatus,
  }));
}

export async function getInstructorAttendanceSummary(instructorId: string) {
  const sessions = await prisma.eventSession.findMany({
    where: { hostInstructorId: instructorId },
    orderBy: { startAt: "desc" },
    include: {
      event: { select: { id: true, title: true } },
      attendances: { select: { status: true } },
      _count: { select: { attendances: true } },
    },
  });

  return sessions.map((s) => ({
    id: s.id,
    eventId: s.event.id,
    eventTitle: s.event.title,
    title: s.title,
    sequence: s.sequence,
    startAt: s.startAt,
    status: s.status,
    totalMarked: s._count.attendances,
    present: s.attendances.filter((a) => a.status === "PRESENT" || a.status === "LATE").length,
  }));
}

export function getInstructorResources(instructorId: string) {
  return prisma.eventResource.findMany({
    where: { event: { instructorId } },
    orderBy: { createdAt: "desc" },
    include: { event: { select: { id: true, title: true } } },
  });
}
