"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/client";
import { requireInstructor } from "@/lib/permissions";
import { instructorProfileSchema } from "@/lib/validations/instructor";
import { readPhotoUpload } from "@/lib/uploads/profile-photo";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateOwnInstructorPhoto(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { instructor } = await requireInstructor();

  const file = formData.get("photo");
  const result = await readPhotoUpload(file instanceof File ? file : null);
  if (!result.ok) return result;

  await prisma.instructor.update({ where: { id: instructor.id }, data: { avatarUrl: result.dataUrl } });

  revalidatePath("/instructor/profile");
  revalidatePath("/instructor");
  return { ok: true };
}

/** Self-service profile edit (docs/instactor.md §2 "Instructor Profile").
 * Deliberately does not touch email/password (login credentials) or slug
 * (the public URL an instructor's Events already link to). */
export async function updateOwnInstructorProfile(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { instructor } = await requireInstructor();

  const getStr = (key: string) => {
    const val = formData.get(key)?.toString().trim();
    return val ? val : undefined;
  };

  const parsed = instructorProfileSchema.safeParse({
    name: formData.get("name"),
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

  await prisma.instructor.update({ where: { id: instructor.id }, data: parsed.data });

  revalidatePath("/instructor/profile");
  revalidatePath("/instructor");
  return { ok: true };
}
