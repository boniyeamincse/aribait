"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/permissions";
import { eventResourceSchema } from "@/lib/validations/resource";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function addEventResource(
  eventId: string,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const parsed = eventResourceSchema.safeParse({
    title: formData.get("title"),
    url: formData.get("url"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the resource form.",
    };
  }

  await prisma.eventResource.create({
    data: { ...parsed.data, eventId, createdById: admin.id },
  });

  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath(`/events`);
  return { ok: true };
}

export async function removeEventResource(resourceId: string) {
  await requireAdmin();
  const resource = await prisma.eventResource.delete({
    where: { id: resourceId },
  });
  revalidatePath(`/admin/events/${resource.eventId}`);
}
