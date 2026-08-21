"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/permissions";
import { writeAuditLog } from "@/lib/audit/log";
import type { UserStatus } from "@/lib/generated/prisma/client";

type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Change a student's account status.
 * Valid transitions:
 *   PENDING     → ACTIVE | SUSPENDED | DEACTIVATED
 *   ACTIVE      → SUSPENDED | DEACTIVATED
 *   SUSPENDED   → ACTIVE | DEACTIVATED
 *   DEACTIVATED → ACTIVE
 */
export async function changeStudentStatus(
  userId: string,
  newStatus: UserStatus,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const student = await prisma.user.findUnique({
    where: { id: userId, role: "STUDENT" },
    select: { id: true, name: true, email: true, status: true },
  });

  if (!student) return { ok: false, error: "Student not found." };
  if (student.status === newStatus) {
    return { ok: false, error: `Student is already ${newStatus}.` };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { status: newStatus },
  });

  await writeAuditLog({
    actorId: admin.id,
    action: "student.status_change",
    targetType: "User",
    targetId: userId,
    summary: `Changed status of ${student.email} from ${student.status} → ${newStatus}`,
  });

  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${userId}`);
  return { ok: true };
}
