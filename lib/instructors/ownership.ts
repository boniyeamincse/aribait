import { notFound } from "next/navigation";

import { prisma } from "@/lib/db/client";
import { requireInstructor } from "@/lib/permissions";

/**
 * Real (non-optimistic) ownership boundary for instructor-facing Event
 * actions/pages — every one of them must call this rather than trusting a
 * hidden UI element (mirrors the requireAdmin()/requireUser() convention in
 * lib/permissions/index.ts).
 */
export async function requireOwnedEvent(eventId: string) {
  const { user, instructor } = await requireInstructor();
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.instructorId !== instructor.id) {
    notFound();
  }
  return { user, instructor, event };
}
