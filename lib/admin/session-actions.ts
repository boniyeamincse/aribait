"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/permissions";
import { writeAuditLog } from "@/lib/audit/log";
import type { SessionStatus } from "@/lib/generated/prisma/client";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateSessionStatus(
  sessionId: string,
  newStatus: SessionStatus
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const session = await prisma.eventSession.findUnique({
    where: { id: sessionId },
    include: { event: true },
  });

  if (!session) return { ok: false, error: "Session not found." };
  
  if (session.status === newStatus) {
    return { ok: true };
  }

  await prisma.eventSession.update({
    where: { id: sessionId },
    data: { status: newStatus },
  });

  await writeAuditLog({
    actorId: admin.id,
    action: "session.status_change",
    targetType: "EventSession",
    targetId: sessionId,
    summary: `Changed status of session "${session.title}" (Event: ${session.event.title}) from ${session.status} to ${newStatus}`,
  });

  revalidatePath("/admin/sessions");
  return { ok: true };
}

export async function updateSessionMeeting(
  sessionId: string,
  formData: FormData
): Promise<ActionResult> {
  const admin = await requireAdmin();
  
  const meetingUrl = formData.get("meetingUrl")?.toString().trim() || null;
  const meetingId = formData.get("meetingId")?.toString().trim() || null;
  const meetingPasscode = formData.get("meetingPasscode")?.toString().trim() || null;

  const session = await prisma.eventSession.findUnique({
    where: { id: sessionId },
    include: { event: true },
  });

  if (!session) return { ok: false, error: "Session not found." };

  await prisma.eventSession.update({
    where: { id: sessionId },
    data: { meetingUrl, meetingId, meetingPasscode },
  });

  await writeAuditLog({
    actorId: admin.id,
    action: "session.meeting_update",
    targetType: "EventSession",
    targetId: sessionId,
    summary: `Updated meeting details for session "${session.title}" (Event: ${session.event.title})`,
  });

  revalidatePath("/admin/sessions");
  return { ok: true };
}
