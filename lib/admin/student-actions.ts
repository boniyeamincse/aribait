"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/permissions";
import { writeAuditLog } from "@/lib/audit/log";
import { slugify } from "@/lib/utils";
import type { UserStatus } from "@/lib/generated/prisma/client";

type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Change a student's account status.
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

/**
 * Promote a STUDENT user to INSTRUCTOR role.
 * - Changes user.role → INSTRUCTOR, user.status → ACTIVE
 * - Creates a linked Instructor profile (UNVERIFIED by default —
 *   admin must separately verify to allow event creation).
 * - Safe to call even if the user already has a linked Instructor row.
 */
export async function promoteToInstructor(userId: string): Promise<ActionResult> {
  const admin = await requireAdmin();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { instructor: true },
  });

  if (!user) return { ok: false, error: "User not found." };
  if (user.role === "INSTRUCTOR") {
    return { ok: false, error: "This user is already an Instructor." };
  }
  if (user.role === "ADMIN") {
    return { ok: false, error: "Cannot demote an Admin to Instructor." };
  }

  // Build a unique slug from their name (or fall back to email prefix)
  const baseName = user.name ?? user.email.split("@")[0];
  let slug = slugify(baseName);

  // Make slug unique if it collides
  const existing = await prisma.instructor.findUnique({ where: { slug } });
  if (existing && existing.userId !== userId) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  await prisma.$transaction(async (tx) => {
    // Update user role + ensure ACTIVE
    await tx.user.update({
      where: { id: userId },
      data: { role: "INSTRUCTOR", status: "ACTIVE" },
    });

    // Create Instructor profile if one doesn't exist yet
    if (!user.instructor) {
      await tx.instructor.create({
        data: {
          userId,
          name: user.name ?? baseName,
          slug,
          email: user.email,
          verificationStatus: "UNVERIFIED",
        },
      });
    } else {
      // Link existing orphan instructor profile to this user
      await tx.instructor.update({
        where: { id: user.instructor.id },
        data: { userId },
      });
    }
  });

  await writeAuditLog({
    actorId: admin.id,
    action: "student.promote_instructor",
    targetType: "User",
    targetId: userId,
    summary: `Promoted ${user.email} from STUDENT → INSTRUCTOR (profile slug: ${slug})`,
  });

  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${userId}`);
  revalidatePath("/admin/instructors");
  return { ok: true };
}
