"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/permissions";
import { writeAuditLog } from "@/lib/audit/log";
import { sendNotification } from "@/lib/notifications";
import { formatBdt } from "@/lib/utils";
import { recordInstructorPaymentSchema, reverseInstructorPaymentSchema } from "@/lib/validations/finance";
import { computeInstructorBalances } from "./balances";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function recordInstructorPayment(
  instructorId: string,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const instructor = await prisma.instructor.findUnique({
    where: { id: instructorId },
    include: { user: { select: { id: true } } },
  });
  if (!instructor) return { ok: false, error: "Instructor not found." };

  const parsed = recordInstructorPaymentSchema.safeParse({
    amountBdt: formData.get("amountBdt"),
    paymentDate: formData.get("paymentDate"),
    method: formData.get("method"),
    referenceNumber: formData.get("referenceNumber"),
    note: formData.get("note"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the payment form." };
  }

  // Admin cannot record a payment greater than the available balance
  // (docs/Payment.md) — balance is always recomputed here, not trusted from
  // a stale client value.
  const balances = await computeInstructorBalances(instructorId);
  if (parsed.data.amountBdt > balances.availableBalance) {
    return {
      ok: false,
      error: `Payment exceeds available balance (${formatBdt(balances.availableBalance)}).`,
    };
  }

  const payment = await prisma.instructorPayment.create({
    data: {
      instructorId,
      amountBdt: parsed.data.amountBdt,
      paymentDate: new Date(parsed.data.paymentDate),
      method: parsed.data.method,
      referenceNumber: parsed.data.referenceNumber,
      note: parsed.data.note,
      recordedById: admin.id,
    },
  });

  await writeAuditLog({
    actorId: admin.id,
    action: "instructor_payment.record",
    targetType: "InstructorPayment",
    targetId: payment.id,
    summary: `Recorded ${formatBdt(parsed.data.amountBdt)} payment to "${instructor.name}" (${parsed.data.method}, ref ${parsed.data.referenceNumber})`,
  });

  if (instructor.user) {
    await sendNotification({
      userId: instructor.user.id,
      type: "INSTRUCTOR_PAYMENT_RECORDED",
      title: `Payment recorded: ${formatBdt(parsed.data.amountBdt)}`,
      body: `Admin recorded a payment of ${formatBdt(parsed.data.amountBdt)} to you via ${parsed.data.method.replace(/_/g, " ")} (ref ${parsed.data.referenceNumber}).`,
    });
  }

  revalidatePath("/admin/instructor-payments");
  revalidatePath(`/admin/instructor-payments/${instructorId}`);
  revalidatePath("/instructor/earnings");
  return { ok: true };
}

export async function reverseInstructorPayment(
  paymentId: string,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const payment = await prisma.instructorPayment.findUnique({
    where: { id: paymentId },
    include: { instructor: { select: { id: true, name: true } } },
  });
  if (!payment) return { ok: false, error: "Payment not found." };
  if (payment.status === "REVERSED") {
    return { ok: false, error: "This payment was already reversed." };
  }

  const parsed = reverseInstructorPaymentSchema.safeParse({ reason: formData.get("reason") });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Enter a reversal reason." };
  }

  await prisma.instructorPayment.update({
    where: { id: paymentId },
    data: {
      status: "REVERSED",
      reversedById: admin.id,
      reversedAt: new Date(),
      reverseReason: parsed.data.reason,
    },
  });

  await writeAuditLog({
    actorId: admin.id,
    action: "instructor_payment.reverse",
    targetType: "InstructorPayment",
    targetId: paymentId,
    summary: `Reversed ${formatBdt(payment.amountBdt)} payment to "${payment.instructor.name}": ${parsed.data.reason}`,
  });

  revalidatePath("/admin/instructor-payments");
  revalidatePath(`/admin/instructor-payments/${payment.instructorId}`);
  revalidatePath("/instructor/earnings");
  return { ok: true };
}
