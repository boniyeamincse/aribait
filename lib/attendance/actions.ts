"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/permissions";

const STATUSES = ["PRESENT", "ABSENT", "LATE", "EXCUSED"] as const;
type Status = (typeof STATUSES)[number];

export async function markAttendance(
  registrationId: string,
  eventSessionId: string,
  status: Status,
) {
  const admin = await requireAdmin();

  if (!STATUSES.includes(status)) {
    return { ok: false as const, error: "Invalid status." };
  }

  await prisma.sessionAttendance.upsert({
    where: {
      registrationId_eventSessionId: { registrationId, eventSessionId },
    },
    update: { status, markedById: admin.id, markedAt: new Date() },
    create: {
      registrationId,
      eventSessionId,
      status,
      markedById: admin.id,
      markedAt: new Date(),
    },
  });

  revalidatePath(`/admin/attendance/${eventSessionId}`);
  return { ok: true as const };
}
