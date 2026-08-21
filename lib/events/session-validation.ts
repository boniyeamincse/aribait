import { prisma } from "@/lib/db/client";

/**
 * Session scheduling rules for the instructor self-serve flow
 * (docs/instactor.md §5). Not used by the admin session actions — admin is
 * trusted to schedule sensibly; this is scoped to instructor-created
 * Sessions for this pass.
 */
export async function validateSessionSchedule(params: {
  eventId: string;
  hostInstructorId: string;
  startAt: Date;
  endAt: Date;
  excludeSessionId?: string;
}): Promise<string | null> {
  const { eventId, hostInstructorId, startAt, endAt, excludeSessionId } = params;

  if (startAt.getTime() < Date.now()) {
    return "Session date cannot be in the past.";
  }

  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  const durationMinutes = (endAt.getTime() - startAt.getTime()) / 60_000;
  const minMinutes = settings?.minSessionDurationMinutes ?? 15;
  const maxMinutes = settings?.maxSessionDurationMinutes ?? 480;
  if (durationMinutes < minMinutes) {
    return `Session must be at least ${minMinutes} minutes long.`;
  }
  if (durationMinutes > maxMinutes) {
    return `Session cannot be longer than ${maxMinutes} minutes.`;
  }

  const sameEventOverlap = await prisma.eventSession.findFirst({
    where: {
      eventId,
      status: { not: "CANCELLED" },
      ...(excludeSessionId ? { id: { not: excludeSessionId } } : {}),
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
  });
  if (sameEventOverlap) {
    return `Overlaps with another Session in this Event ("${sameEventOverlap.title}").`;
  }

  const crossEventOverlap = await prisma.eventSession.findFirst({
    where: {
      hostInstructorId,
      eventId: { not: eventId },
      status: { not: "CANCELLED" },
      ...(excludeSessionId ? { id: { not: excludeSessionId } } : {}),
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
    include: { event: { select: { title: true } } },
  });
  if (crossEventOverlap) {
    return `Instructor is already scheduled for a Session in "${crossEventOverlap.event.title}" at this time.`;
  }

  return null;
}
