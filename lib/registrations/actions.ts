"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/permissions";

type ActionResult = { ok: true; waitlisted: boolean } | { ok: false; error: string };

export async function registerFree(eventId: string): Promise<ActionResult> {
  const user = await requireUser();

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return { ok: false, error: "Event not found." };
  if (event.status !== "PUBLISHED") {
    return { ok: false, error: "Registration is not open for this Event." };
  }
  if (event.priceBdt !== 0) {
    return { ok: false, error: "This Event requires payment to register." };
  }
  const now = new Date();
  if (event.registrationOpensAt && now < event.registrationOpensAt) {
    return { ok: false, error: "Registration has not opened yet." };
  }
  if (event.registrationClosesAt && now > event.registrationClosesAt) {
    return { ok: false, error: "Registration has closed." };
  }

  const existing = await prisma.registration.findUnique({
    where: { userId_eventId: { userId: user.id, eventId } },
  });
  if (existing) {
    return { ok: false, error: "You are already registered for this Event." };
  }

  const waitlisted = await prisma.$transaction(
    async (tx) => {
      const confirmedCount = await tx.registration.count({
        where: { eventId, status: "CONFIRMED" },
      });
      const isFull =
        event.capacity !== null && confirmedCount >= event.capacity;

      await tx.registration.create({
        data: {
          userId: user.id,
          eventId,
          status: isFull ? "WAITLISTED" : "CONFIRMED",
          priceSnapshotBdt: 0,
          confirmedAt: isFull ? null : new Date(),
        },
      });

      return isFull;
    },
    { isolationLevel: "Serializable" },
  );

  revalidatePath(`/events/${event.slug}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/events");
  return { ok: true, waitlisted };
}

export async function cancelRegistration(registrationId: string) {
  const user = await requireUser();

  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
  });
  if (!registration || registration.userId !== user.id) {
    return { ok: false as const, error: "Registration not found." };
  }
  if (registration.status === "CANCELLED") {
    return { ok: true as const };
  }

  await prisma.$transaction(async (tx) => {
    await tx.registration.update({
      where: { id: registrationId },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });

    if (registration.status === "CONFIRMED") {
      const nextInLine = await tx.registration.findFirst({
        where: { eventId: registration.eventId, status: "WAITLISTED" },
        orderBy: { createdAt: "asc" },
      });
      if (nextInLine) {
        await tx.registration.update({
          where: { id: nextInLine.id },
          data: { status: "CONFIRMED", confirmedAt: new Date() },
        });
      }
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/events");
  return { ok: true as const };
}
