"use server";

import { randomBytes, randomInt } from "crypto";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/permissions";
import { writeAuditLog } from "@/lib/audit/log";
import { sendNotification } from "@/lib/notifications";

type ActionResult = { ok: true } | { ok: false; error: string };

async function uniqueCertificateNumber() {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 10; attempt++) {
    const suffix = randomInt(100_000, 999_999);
    const candidate = `ARIBA-${year}-${suffix}`;
    const existing = await prisma.certificate.findUnique({
      where: { certificateNumber: candidate },
    });
    if (!existing) return candidate;
  }
  throw new Error("Could not generate a unique certificate number.");
}

export async function issueCertificate(
  registrationId: string,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { event: true, certificate: true },
  });
  if (!registration) return { ok: false, error: "Registration not found." };
  if (registration.status !== "COMPLETED") {
    return {
      ok: false,
      error: "Only completed registrations are eligible for a certificate.",
    };
  }
  if (registration.certificate) {
    return { ok: false, error: "A certificate already exists for this registration." };
  }

  const certificateNumber = await uniqueCertificateNumber();
  const verificationToken = randomBytes(16).toString("hex");

  const certificate = await prisma.certificate.create({
    data: {
      registrationId,
      certificateNumber,
      verificationToken,
      issuedById: admin.id,
    },
  });

  await writeAuditLog({
    actorId: admin.id,
    action: "certificate.issue",
    targetType: "Certificate",
    targetId: certificate.id,
    summary: `Issued certificate ${certificateNumber} for registration ${registrationId}`,
  });

  await sendNotification({
    userId: registration.userId,
    type: "CERTIFICATE_ISSUED",
    title: `Certificate issued: ${registration.event.title}`,
    body: `Your certificate for ${registration.event.title} is ready to download.`,
    eventId: registration.eventId,
    email: {
      subject: `Certificate issued: ${registration.event.title}`,
      text: `Your certificate for ${registration.event.title} is ready to download from your dashboard.`,
    },
  });

  revalidatePath("/admin/certificates");
  revalidatePath("/dashboard/certificates");
  return { ok: true };
}

export async function revokeCertificate(
  certificateId: string,
  reason: string,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  if (!reason || reason.trim().length < 5) {
    return { ok: false, error: "Enter a reason for revoking this certificate." };
  }

  const certificate = await prisma.certificate.update({
    where: { id: certificateId },
    data: {
      status: "REVOKED",
      revokedById: admin.id,
      revokedAt: new Date(),
      revokeReason: reason,
    },
  });

  await writeAuditLog({
    actorId: admin.id,
    action: "certificate.revoke",
    targetType: "Certificate",
    targetId: certificateId,
    summary: `Revoked certificate ${certificate.certificateNumber}: ${reason}`,
  });

  revalidatePath("/admin/certificates");
  revalidatePath("/dashboard/certificates");
  return { ok: true };
}

export async function reissueCertificate(certificateId: string): Promise<ActionResult> {
  const admin = await requireAdmin();

  const certificate = await prisma.certificate.update({
    where: { id: certificateId },
    data: {
      status: "ISSUED",
      revokedById: null,
      revokedAt: null,
      revokeReason: null,
    },
  });

  await writeAuditLog({
    actorId: admin.id,
    action: "certificate.reissue",
    targetType: "Certificate",
    targetId: certificateId,
    summary: `Reissued certificate ${certificate.certificateNumber}`,
  });

  revalidatePath("/admin/certificates");
  revalidatePath("/dashboard/certificates");
  return { ok: true };
}
