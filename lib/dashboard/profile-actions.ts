"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/permissions";
import { readPhotoUpload } from "@/lib/uploads/profile-photo";
import { hashPassword, verifyPassword } from "@/lib/security/password";
import { passwordSchema } from "@/lib/validations/auth";

type ActionResult = { ok: true } | { ok: false; error: string };

/** Shared by Student, Admin, and Instructor — the login account (User) is
 * the same row regardless of role; Instructor's separate *public* photo
 * (Instructor.avatarUrl) is a different field, see lib/instructors/profile-actions.ts. */
export async function updateOwnPhoto(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();

  const file = formData.get("photo");
  const result = await readPhotoUpload(file instanceof File ? file : null);
  if (!result.ok) return result;

  await prisma.user.update({ where: { id: user.id }, data: { image: result.dataUrl } });

  revalidatePath("/dashboard/profile");
  revalidatePath("/admin/profile");
  revalidatePath("/instructor/profile");
  return { ok: true };
}

/** Change-password-while-logged-in, for any role (all share User.passwordHash). */
export async function changeOwnPassword(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const sessionUser = await requireUser();

  const currentPassword = formData.get("currentPassword")?.toString() ?? "";
  const newPassword = formData.get("newPassword")?.toString() ?? "";
  const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";

  if (newPassword !== confirmPassword) {
    return { ok: false, error: "New passwords do not match." };
  }
  const parsed = passwordSchema.safeParse({ password: newPassword });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Password must be at least 8 characters." };
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: sessionUser.id } });
  if (!user.passwordHash || !(await verifyPassword(currentPassword, user.passwordHash))) {
    return { ok: false, error: "Current password is incorrect." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { ok: true };
}
