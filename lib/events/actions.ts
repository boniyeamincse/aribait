"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/permissions";
import { eventSchema } from "@/lib/validations/event";
import { slugify } from "@/lib/utils";

type ActionResult = { ok: true } | { ok: false; error: string };

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
    registrationOpensAt: formData.get("registrationOpensAt") ?? undefined,
    registrationClosesAt: formData.get("registrationClosesAt") ?? undefined,
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
    featured: formData.get("featured") ?? undefined,
    termsAndRefundPolicy: formData.get("termsAndRefundPolicy") ?? undefined,
  });
}

export async function createEvent(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

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

  revalidatePath("/admin/events");
  redirect(`/admin/events/${event.id}`);
}

export async function updateEvent(
  eventId: string,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = parseEventForm(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the form for errors.",
    };
  }

  await prisma.event.update({ where: { id: eventId }, data: parsed.data });
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/events");
  return { ok: true };
}

export async function publishEvent(eventId: string) {
  await requireAdmin();
  await prisma.event.update({
    where: { id: eventId },
    data: { status: "PUBLISHED" },
  });
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/events");
  revalidatePath("/events");
}

export async function cancelEvent(eventId: string) {
  await requireAdmin();
  await prisma.event.update({
    where: { id: eventId },
    data: { status: "CANCELLED" },
  });
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/events");
  revalidatePath("/events");
}

export async function archiveEvent(eventId: string) {
  await requireAdmin();
  await prisma.event.update({
    where: { id: eventId },
    data: { status: "ARCHIVED" },
  });
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/events");
  revalidatePath("/events");
}
