"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/permissions";
import { readPhotoUpload } from "@/lib/uploads/profile-photo";

type ActionResult = { ok: true } | { ok: false; error: string };

/** Shared by Student and Admin — both read/edit their own profile at
 * /dashboard/profile. Instructor has a separate photo (Instructor.avatarUrl,
 * see lib/instructors/profile-actions.ts) since it's a public profile field,
 * not the login account itself. */
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
  return { ok: true };
}
