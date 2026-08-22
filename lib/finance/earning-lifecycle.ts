import { Prisma } from "@/lib/generated/prisma/client";

type Tx = Prisma.TransactionClient;

/** Called from lib/payments/actions.ts approveManualPayment, inside the
 * same $transaction that flips Payment -> PAID and Registration -> CONFIRMED.
 * Creates exactly one PENDING earning per registration (registrationId is
 * @unique on InstructorEarning, so a duplicate call is a hard schema error,
 * not silent double-counting). */
export async function createEarningForRegistration(tx: Tx, registrationId: string) {
  const registration = await tx.registration.findUniqueOrThrow({
    where: { id: registrationId },
    include: { event: { select: { id: true, instructorId: true } }, payment: true },
  });
  if (!registration.payment || registration.payment.status !== "PAID") return;

  const settings = await tx.settings.findUniqueOrThrow({ where: { id: 1 } });
  const grossAmountBdt = registration.payment.amountBdt;
  const instructorPct = settings.instructorCommissionPct;
  const instructorAmountBdt = Math.round((grossAmountBdt * instructorPct) / 100);
  const platformAmountBdt = grossAmountBdt - instructorAmountBdt;

  await tx.instructorEarning.create({
    data: {
      instructorId: registration.event.instructorId,
      eventId: registration.event.id,
      registrationId,
      grossAmountBdt,
      instructorPct,
      instructorAmountBdt,
      platformAmountBdt,
    },
  });
}

/** Called from lib/events/actions.ts completeEvent, after registrations are
 * bulk-marked COMPLETED. Mirrors the attendance eligibility check in
 * lib/certificates/actions.ts issueCertificate — a registration whose event
 * has minAttendanceSessions set must meet it before its earning becomes
 * AVAILABLE. Registrations that don't meet it simply stay PENDING; there is
 * no "disqualified" status in docs/Payment.md. */
export async function settleEarningsForCompletedEvent(
  tx: Tx,
  eventId: string,
  registrationIds: string[],
) {
  if (registrationIds.length === 0) return;

  const event = await tx.event.findUniqueOrThrow({
    where: { id: eventId },
    select: { minAttendanceSessions: true },
  });

  const eligibleIds: string[] = [];
  for (const registrationId of registrationIds) {
    if (event.minAttendanceSessions !== null) {
      const attendedCount = await tx.sessionAttendance.count({
        where: { registrationId, status: { in: ["PRESENT", "LATE"] } },
      });
      if (attendedCount < event.minAttendanceSessions) continue;
    }
    eligibleIds.push(registrationId);
  }
  if (eligibleIds.length === 0) return;

  await tx.instructorEarning.updateMany({
    where: { registrationId: { in: eligibleIds }, status: "PENDING" },
    data: { status: "AVAILABLE", availableAt: new Date() },
  });
}

/** Called from lib/registrations/actions.ts cancelRegistration, CONFIRMED
 * branch. Reverses a not-yet-paid-out earning to CANCELLED. An earning
 * already folded into a recorded payment isn't un-paid here — that's an
 * out-of-scope correction path (docs/Payment.md defers refund workflow). */
export async function reverseEarningForRegistration(tx: Tx, registrationId: string) {
  await tx.instructorEarning.updateMany({
    where: { registrationId, status: { in: ["PENDING", "AVAILABLE"] } },
    data: { status: "CANCELLED" },
  });
}
