import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/permissions";
import { generateCertificatePdf } from "@/lib/certificates/pdf";

export async function GET(
  _request: Request,
  context: RouteContext<"/dashboard/certificates/[certificateId]/download">,
) {
  const { certificateId } = await context.params;
  const user = await requireUser();

  const certificate = await prisma.certificate.findUnique({
    where: { id: certificateId },
    include: { registration: { include: { user: true, event: true } } },
  });

  if (!certificate || certificate.registration.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (certificate.status === "REVOKED") {
    return NextResponse.json({ error: "This certificate has been revoked." }, { status: 410 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const pdfBytes = await generateCertificatePdf({
    studentName: certificate.registration.user.name ?? certificate.registration.user.email,
    eventTitle: certificate.registration.event.title,
    certificateNumber: certificate.certificateNumber,
    issuedAt: certificate.issuedAt,
    verificationUrl: `${appUrl}/certificates/verify/${certificate.verificationToken}`,
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${certificate.certificateNumber}.pdf"`,
    },
  });
}
