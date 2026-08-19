import { prisma } from "@/lib/db/client";

const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000;

export function dhakaMonthRangeFor(year: number, month: number) {
  return {
    start: new Date(Date.UTC(year, month, 1, 0, 0, 0) - DHAKA_OFFSET_MS),
    end: new Date(Date.UTC(year, month + 1, 1, 0, 0, 0) - DHAKA_OFFSET_MS),
  };
}

export function dhakaDateKey(date: Date) {
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
}

export async function getCalendarSessions({
  start,
  end,
  categoryId,
  instructorId,
  platform,
}: {
  start: Date;
  end: Date;
  categoryId?: string;
  instructorId?: string;
  platform?: string;
}) {
  const sessions = await prisma.eventSession.findMany({
    where: {
      startAt: { gte: start, lt: end },
      status: { not: "CANCELLED" },
      ...(instructorId ? { hostInstructorId: instructorId } : {}),
      ...(platform ? { platform: platform as never } : {}),
      ...(categoryId ? { event: { categoryId } } : {}),
    },
    include: {
      event: { select: { id: true, title: true, categoryId: true } },
      hostInstructor: { select: { id: true, name: true } },
    },
    orderBy: { startAt: "asc" },
  });

  const byDay = new Map<string, typeof sessions>();
  for (const session of sessions) {
    const key = dhakaDateKey(session.startAt);
    const existing = byDay.get(key) ?? [];
    existing.push(session);
    byDay.set(key, existing);
  }

  return Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, daySessions]) => ({ date, sessions: daySessions }));
}

export function getInstructorSchedulingConflicts(
  sessions: { id: string; hostInstructorId: string | null; startAt: Date; endAt: Date }[],
) {
  const conflictIds = new Set<string>();
  const byInstructor = new Map<string, typeof sessions>();
  for (const s of sessions) {
    if (!s.hostInstructorId) continue;
    const list = byInstructor.get(s.hostInstructorId) ?? [];
    list.push(s);
    byInstructor.set(s.hostInstructorId, list);
  }
  for (const list of byInstructor.values()) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const b = list[j];
        if (a.startAt < b.endAt && b.startAt < a.endAt) {
          conflictIds.add(a.id);
          conflictIds.add(b.id);
        }
      }
    }
  }
  return conflictIds;
}
