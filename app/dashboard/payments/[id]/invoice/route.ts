import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/permissions";
import { generateInvoicePdf } from "@/lib/payments/invoice-pdf";

export async function GET(
  _request: Request,
  context: RouteContext<"/dashboard/payments/[id]/invoice">,
) {
  const { id } = await context.params;
  const user = await requireUser();

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      registration: { include: { user: true, event: true } },
      transactions: { where: { status: "PAID" }, orderBy: { reviewedAt: "desc" }, take: 1 },
    },
  });

  if (!payment || payment.registration.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  // Invoices are only generated for a verified (admin-approved) payment —
  // never from a client-reported "success" state.
  if (payment.status !== "PAID") {
    return NextResponse.json({ error: "This payment has not been verified yet." }, { status: 409 });
  }

  const transaction = payment.transactions[0];
  const invoiceNumber = `ARIBA-INV-${payment.id.slice(-8).toUpperCase()}`;

  const pdfBytes = await generateInvoicePdf({
    invoiceNumber,
    registrationId: payment.registration.id,
    trxId: transaction?.trxId ?? "—",
    studentName: payment.registration.user.name ?? payment.registration.user.email,
    studentEmail: payment.registration.user.email,
    eventTitle: payment.registration.event.title,
    originalPriceBdt: payment.registration.priceSnapshotBdt,
    couponCode: payment.registration.couponCodeSnapshot,
    discountBdt: payment.registration.discountAmountSnapshotBdt,
    finalAmountBdt: payment.amountBdt,
    paymentMethod: transaction?.method ?? "—",
    paymentDate: transaction?.reviewedAt ?? payment.updatedAt,
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoiceNumber}.pdf"`,
    },
  });
}
