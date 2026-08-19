"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/permissions";
import { instructorSchema } from "@/lib/validations/instructor";
import { slugify } from "@/lib/utils";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function createInstructor(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = instructorSchema.safeParse({
    name: formData.get("name"),
    title: formData.get("title") || undefined,
    bio: formData.get("bio") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid instructor name." };
  }

  const slug = slugify(parsed.data.name);
  const existing = await prisma.instructor.findUnique({ where: { slug } });
  if (existing) {
    return {
      ok: false,
      error: "An instructor with this name already exists.",
    };
  }

  await prisma.instructor.create({ data: { ...parsed.data, slug } });
  revalidatePath("/admin/instructors");
  return { ok: true };
}
