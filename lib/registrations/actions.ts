"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/permissions";
import { validateCoupon } from "@/lib/discounts/validate";
import { sendNotification } from "@/lib/notifications";
import { reverseEarningForRegistration } from "@/lib/finance/earning-lifecycle";

type ActionResult =
  | { ok: true; waitlisted: boolean; registrationId: string }
  | { ok: false; error: string };

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

  const { waitlisted, registrationId } = await prisma.$transaction(
    async (tx) => {
      const confirmedCount = await tx.registration.count({
        where: { eventId, status: "CONFIRMED" },
      });
      const isFull =
        event.capacity !== null && confirmedCount >= event.capacity;

      const registration = await tx.registration.create({
        data: {
          userId: user.id,
          eventId,
          status: isFull ? "WAITLISTED" : "CONFIRMED",
          priceSnapshotBdt: 0,
          confirmedAt: isFull ? null : new Date(),
        },
      });

      return { waitlisted: isFull, registrationId: registration.id };
    },
    { isolationLevel: "Serializable" },
  );

  await sendNotification({
    userId: user.id,
    type: "REGISTRATION_CONFIRMED",
    title: waitlisted ? `Waitlisted: ${event.title}` : `Registered: ${event.title}`,
    body: waitlisted
      ? `You're on the waitlist for ${event.title} — we'll confirm your seat if one opens up.`
      : `You're confirmed for ${event.title}. Check My Sessions for join details.`,
    eventId: event.id,
    email: {
      subject: waitlisted ? `Waitlisted: ${event.title}` : `Registered: ${event.title}`,
      text: waitlisted
        ? `You're on the waitlist for ${event.title}.`
        : `You're confirmed for ${event.title}.`,
    },
  });

  revalidatePath(`/events/${event.slug}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/events");
  return { ok: true, waitlisted, registrationId };
}

type CheckoutResult =
  | { ok: true; paymentId: string }
  | { ok: false; error: string };

// Paid events do not support waitlisting in the MVP — if capacity is full,
// checkout is blocked outright (see the note in prisma/schema.prisma above
// the SeatHold model).
export async function startPaidCheckout(
  eventId: string,
  couponCode?: string,
): Promise<CheckoutResult> {
  const user = await requireUser();

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return { ok: false, error: "Event not found." };
  if (event.status !== "PUBLISHED") {
    return { ok: false, error: "Registration is not open for this Event." };
  }
  if (event.priceBdt === 0) {
    return { ok: false, error: "This Event is free — use free registration." };
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
    include: { payment: true },
  });

  if (existing) {
    if (existing.status === "PENDING_PAYMENT" && existing.payment) {
      return { ok: true, paymentId: existing.payment.id };
    }
    if (existing.status !== "CANCELLED" && existing.status !== "EXPIRED") {
      return {
        ok: false,
        error: "You already have a registration for this Event.",
      };
    }
  }

  let discountAmountBdt = 0;
  let discountId: string | null = null;
  const normalizedCoupon = couponCode?.trim();
  if (normalizedCoupon) {
    const result = await validateCoupon(
      normalizedCoupon,
      eventId,
      user.id,
      event.priceBdt,
    );
    if (!result.ok) return { ok: false, error: result.error };
    discountAmountBdt = result.discountAmountBdt;
    discountId = result.discountId;
  }
  const payableBdt = Math.max(0, event.priceBdt - discountAmountBdt);

  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  const holdMinutes = settings?.seatHoldMinutes ?? 15;

  try {
    const paymentId = await prisma.$transaction(
      async (tx) => {
        const confirmedCount = await tx.registration.count({
          where: { eventId, status: "CONFIRMED" },
        });
        const activeHolds = await tx.seatHold.count({
          where: { eventId, status: "HELD", expiresAt: { gt: now } },
        });
        const takenSeats = confirmedCount + activeHolds;
        if (event.capacity !== null && takenSeats >= event.capacity) {
          throw new Error("EVENT_FULL");
        }

        const registration = existing
          ? await tx.registration.update({
              where: { id: existing.id },
              data: {
                status: "PENDING_PAYMENT",
                priceSnapshotBdt: event.priceBdt,
                discountAmountSnapshotBdt: discountAmountBdt,
                couponCodeSnapshot: normalizedCoupon?.toUpperCase() ?? null,
                confirmedAt: null,
                cancelledAt: null,
                cancellationReason: null,
              },
            })
          : await tx.registration.create({
              data: {
                userId: user.id,
                eventId,
                status: "PENDING_PAYMENT",
                priceSnapshotBdt: event.priceBdt,
                discountAmountSnapshotBdt: discountAmountBdt,
                couponCodeSnapshot: normalizedCoupon?.toUpperCase() ?? null,
              },
            });

        const expiresAt = new Date(now.getTime() + holdMinutes * 60_000);
        await tx.seatHold.upsert({
          where: { registrationId: registration.id },
          update: { status: "HELD", expiresAt },
          create: {
            eventId,
            userId: user.id,
            registrationId: registration.id,
            expiresAt,
          },
        });

        if (discountId) {
          await tx.discountRedemption.upsert({
            where: { registrationId: registration.id },
            update: { discountId, discountAmountBdt },
            create: {
              discountId,
              userId: user.id,
              registrationId: registration.id,
              discountAmountBdt,
            },
          });
        }

        const payment = await tx.payment.upsert({
          where: { registrationId: registration.id },
          update: { amountBdt: payableBdt, status: "INITIATED" },
          create: {
            registrationId: registration.id,
            amountBdt: payableBdt,
            status: "INITIATED",
          },
        });

        return payment.id;
      },
      { isolationLevel: "Serializable" },
    );

    revalidatePath(`/events/${event.slug}`);
    revalidatePath("/dashboard/payments");
    return { ok: true, paymentId };
  } catch (error) {
    if (error instanceof Error && error.message === "EVENT_FULL") {
      return { ok: false, error: "This Event is full." };
    }
    throw error;
  }
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

  const promotedUserId = await prisma.$transaction(async (tx) => {
    await tx.registration.update({
      where: { id: registrationId },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });

    if (registration.status === "PENDING_PAYMENT") {
      await tx.seatHold.updateMany({
        where: { registrationId, status: "HELD" },
        data: { status: "EXPIRED" },
      });
      await tx.payment.updateMany({
        where: { registrationId, status: { in: ["INITIATED", "PENDING"] } },
        data: { status: "CANCELLED" },
      });
    }

    if (registration.status === "CONFIRMED") {
      await reverseEarningForRegistration(tx, registrationId);

      const nextInLine = await tx.registration.findFirst({
        where: { eventId: registration.eventId, status: "WAITLISTED" },
        orderBy: { createdAt: "asc" },
      });
      if (nextInLine) {
        await tx.registration.update({
          where: { id: nextInLine.id },
          data: { status: "CONFIRMED", confirmedAt: new Date() },
        });
        return nextInLine.userId;
      }
    }
    return null;
  });

  if (promotedUserId) {
    const event = await prisma.event.findUniqueOrThrow({
      where: { id: registration.eventId },
    });
    await sendNotification({
      userId: promotedUserId,
      type: "WAITLIST_PROMOTED",
      title: `Seat confirmed: ${event.title}`,
      body: `A seat opened up and you're now confirmed for ${event.title}.`,
      eventId: event.id,
      email: {
        subject: `Seat confirmed: ${event.title}`,
        text: `A seat opened up and you're now confirmed for ${event.title}.`,
      },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/events");
  revalidatePath("/dashboard/payments");
  return { ok: true as const };
}
