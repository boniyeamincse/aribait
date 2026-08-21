"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/client";
import { requireOwnedEvent } from "@/lib/instructors/ownership";
import { eventResourceSchema } from "@/lib/validations/resource";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function addInstructorEventResource(
  eventId: string,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { user } = await requireOwnedEvent(eventId);

  const parsed = eventResourceSchema.safeParse({
    title: formData.get("title"),
    url: formData.get("url"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the resource form." };
  }

  await prisma.eventResource.create({
    data: { ...parsed.data, eventId, createdById: user.id },
  });

  revalidatePath(`/instructor/events/${eventId}`);
  return { ok: true };
}
