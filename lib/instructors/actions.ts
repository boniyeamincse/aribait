"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/permissions";
import { instructorSchema, instructorProfileSchema } from "@/lib/validations/instructor";
import { z } from "zod";
import { hashPassword } from "@/lib/security/password";
import { slugify } from "@/lib/utils";
import { writeAuditLog } from "@/lib/audit/log";
import type { InstructorVerificationStatus, UserStatus } from "@/lib/generated/prisma/client";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function createInstructor(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const getStr = (key: string) => {
    const val = formData.get(key)?.toString().trim();
    return val ? val : undefined;
  };

  const parsed = instructorSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    title: getStr("title"),
    bio: getStr("bio"),
    company: getStr("company"),
    phone: getStr("phone"),
    website: getStr("website"),
    twitterUrl: getStr("twitterUrl"),
    linkedinUrl: getStr("linkedinUrl"),
    githubUrl: getStr("githubUrl"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please enter valid instructor information (name, email, an 8+ character password, and valid URLs).",
    };
  }
  const { password, ...profile } = parsed.data;

  const slug = slugify(profile.name);
  const [existingSlug, existingEmail] = await Promise.all([
    prisma.instructor.findUnique({ where: { slug } }),
    prisma.user.findUnique({ where: { email: profile.email } }),
  ]);
  if (existingSlug) {
    return {
      ok: false,
      error: "An instructor with this name already exists.",
    };
  }
  if (existingEmail) {
    return {
      ok: false,
      error: "An account with this email already exists.",
    };
  }

  const passwordHash = await hashPassword(password);
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: profile.name,
        email: profile.email,
        passwordHash,
        role: "INSTRUCTOR",
        status: "ACTIVE",
        emailVerified: new Date(),
      },
    });
    await tx.instructor.create({
      data: { ...profile, slug, userId: user.id },
    });
  });

  revalidatePath("/admin/instructors");
  return { ok: true };
}

/** Instructor self-serve event eligibility gate (docs/instactor.md §1) —
 * an Instructor stays UNVERIFIED (can't submit Events) until an admin
 * explicitly flips this. */
export async function setInstructorVerification(
  instructorId: string,
  status: InstructorVerificationStatus,
) {
  const admin = await requireAdmin();

  const instructor = await prisma.instructor.update({
    where: { id: instructorId },
    data: { verificationStatus: status },
  });

  await writeAuditLog({
    actorId: admin.id,
    action: "instructor.verify",
    targetType: "Instructor",
    targetId: instructorId,
    summary: `Set "${instructor.name}" verification status to ${status}`,
  });

  revalidatePath("/admin/instructors");
}

/** Activate/Suspend/Deactivate an instructor's login account (User.status). */
export async function setInstructorAccountStatus(userId: string, newStatus: UserStatus) {
  const admin = await requireAdmin();

  const user = await prisma.user.findUnique({
    where: { id: userId, role: "INSTRUCTOR" },
    select: { id: true, email: true, status: true },
  });
  if (!user) return;

  await prisma.user.update({
    where: { id: userId },
    data: { status: newStatus },
  });

  await writeAuditLog({
    actorId: admin.id,
    action: "instructor.status_change",
    targetType: "User",
    targetId: userId,
    summary: `Changed status of ${user.email} from ${user.status} → ${newStatus}`,
  });

  revalidatePath("/admin/instructors");
}

// Admin edit — unlike the self-serve profile form (instructorProfileSchema),
// admins may also correct the public contact email (Instructor.email). This
// is deliberately separate from the login email (User.email), which stays
// out of scope here — changing a login identity needs its own dedicated flow.
const instructorAdminEditSchema = instructorProfileSchema.extend({
  email: z.string().email().max(150).optional(),
});

export async function updateInstructorProfileAdmin(
  instructorId: string,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const getStr = (key: string) => {
    const val = formData.get(key)?.toString().trim();
    return val ? val : undefined;
  };

  const parsed = instructorAdminEditSchema.safeParse({
    name: formData.get("name"),
    email: getStr("email"),
    title: getStr("title"),
    bio: getStr("bio"),
    company: getStr("company"),
    phone: getStr("phone"),
    website: getStr("website"),
    twitterUrl: getStr("twitterUrl"),
    linkedinUrl: getStr("linkedinUrl"),
    githubUrl: getStr("githubUrl"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please check the form for errors.",
    };
  }

  const instructor = await prisma.instructor.update({
    where: { id: instructorId },
    data: parsed.data,
  });

  await writeAuditLog({
    actorId: admin.id,
    action: "instructor.profile_edit",
    targetType: "Instructor",
    targetId: instructorId,
    summary: `Edited profile of "${instructor.name}"`,
  });

  revalidatePath("/admin/instructors");
  revalidatePath(`/admin/instructors/${instructorId}`);
  revalidatePath(`/instructors/${instructor.slug}`);
  return { ok: true };
}
