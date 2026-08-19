"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/client";
import { requireAdmin, requireUser } from "@/lib/permissions";
import { paymentProofSchema, rejectPaymentSchema } from "@/lib/validations/payment";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function submitManualPaymentProof(
  paymentId: string,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { registration: true },
  });
  if (!payment || payment.registration.userId !== user.id) {
    return { ok: false, error: "Payment not found." };
  }
  if (payment.status !== "INITIATED" && payment.status !== "FAILED") {
    return {
      ok: false,
      error: "This payment already has a submission under review.",
    };
  }

  const parsed = paymentProofSchema.safeParse({
    method: formData.get("method"),
    senderMsisdn: formData.get("senderMsisdn"),
    trxId: formData.get("trxId"),
    proofImageUrl: formData.get("proofImageUrl") ?? "",
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the payment form.",
    };
  }

  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  const receivingMsisdn = settings?.bkashNagadReceivingMsisdn ?? "01914638653";

  const conflicting = await prisma.paymentTransaction.findUnique({
    where: {
      method_trxId: { method: parsed.data.method, trxId: parsed.data.trxId },
    },
  });
  if (conflicting && conflicting.paymentId !== paymentId) {
    return {
      ok: false,
      error: "This transaction ID has already been used for another registration.",
    };
  }

  await prisma.$transaction(async (tx) => {
    if (conflicting) {
      await tx.paymentTransaction.update({
        where: { id: conflicting.id },
        data: {
          senderMsisdn: parsed.data.senderMsisdn,
          proofImageUrl: parsed.data.proofImageUrl,
          status: "PENDING",
          reviewedById: null,
          reviewedAt: null,
          reviewNote: null,
        },
      });
    } else {
      await tx.paymentTransaction.create({
        data: {
          paymentId,
          method: parsed.data.method,
          receivingMsisdn,
          senderMsisdn: parsed.data.senderMsisdn,
          trxId: parsed.data.trxId,
          proofImageUrl: parsed.data.proofImageUrl,
        },
      });
    }

    await tx.payment.update({
      where: { id: paymentId },
      data: { status: "PENDING" },
    });
  });

  revalidatePath(`/dashboard/payments/${paymentId}`);
  revalidatePath("/dashboard/payments");
  revalidatePath("/admin/payments");
  return { ok: true };
}

export async function approveManualPayment(transactionId: string) {
  const admin = await requireAdmin();

  const transaction = await prisma.paymentTransaction.findUnique({
    where: { id: transactionId },
    include: { payment: { include: { registration: true } } },
  });
  if (!transaction) return { ok: false as const, error: "Not found." };

  await prisma.$transaction(async (tx) => {
    await tx.paymentTransaction.update({
      where: { id: transactionId },
      data: {
        status: "PAID",
        reviewedById: admin.id,
        reviewedAt: new Date(),
        reviewNote: null,
      },
    });
    await tx.payment.update({
      where: { id: transaction.paymentId },
      data: { status: "PAID" },
    });
    await tx.registration.update({
      where: { id: transaction.payment.registrationId },
      data: { status: "CONFIRMED", confirmedAt: new Date() },
    });
    await tx.seatHold.updateMany({
      where: { registrationId: transaction.payment.registrationId },
      data: { status: "CONFIRMED" },
    });
  });

  revalidatePath("/admin/payments");
  revalidatePath("/dashboard/payments");
  revalidatePath("/dashboard/events");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function rejectManualPayment(
  transactionId: string,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const parsed = rejectPaymentSchema.safeParse({
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Enter a rejection reason.",
    };
  }

  const transaction = await prisma.paymentTransaction.findUnique({
    where: { id: transactionId },
  });
  if (!transaction) return { ok: false, error: "Not found." };

  await prisma.$transaction(async (tx) => {
    await tx.paymentTransaction.update({
      where: { id: transactionId },
      data: {
        status: "FAILED",
        reviewedById: admin.id,
        reviewedAt: new Date(),
        reviewNote: parsed.data.reason,
      },
    });
    await tx.payment.update({
      where: { id: transaction.paymentId },
      data: { status: "FAILED" },
    });
  });

  revalidatePath("/admin/payments");
  revalidatePath("/dashboard/payments");
  return { ok: true };
}
