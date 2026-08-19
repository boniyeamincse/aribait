import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/permissions";
import { generateEnrollmentConfirmationPdf } from "@/lib/payments/invoice-pdf";

export async function GET(
  _request: Request,
  context: RouteContext<"/dashboard/registrations/[registrationId]/confirmation">,
) {
  const { registrationId } = await context.params;
  const user = await requireUser();

  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { user: true, event: true },
  });

  if (!registration || registration.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  // Only for genuinely free registrations that don't need payment verification.
  if (registration.priceSnapshotBdt !== 0) {
    return NextResponse.json({ error: "This registration requires a paid invoice, not a confirmation." }, { status: 409 });
  }
  if (registration.status !== "CONFIRMED" && registration.status !== "COMPLETED") {
    return NextResponse.json({ error: "This registration is not confirmed." }, { status: 409 });
  }

  const confirmationNumber = `ARIBA-CONF-${registration.id.slice(-8).toUpperCase()}`;

  const pdfBytes = await generateEnrollmentConfirmationPdf({
    confirmationNumber,
    registrationId: registration.id,
    studentName: registration.user.name ?? registration.user.email,
    studentEmail: registration.user.email,
    eventTitle: registration.event.title,
    registeredAt: registration.confirmedAt ?? registration.createdAt,
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${confirmationNumber}.pdf"`,
    },
  });
}
