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

  const getStr = (key: string) => {
    const val = formData.get(key)?.toString().trim();
    return val ? val : undefined;
  };

  const parsed = instructorSchema.safeParse({
    name: formData.get("name"),
    title: getStr("title"),
    bio: getStr("bio"),
    email: getStr("email"),
    company: getStr("company"),
    phone: getStr("phone"),
    website: getStr("website"),
    twitterUrl: getStr("twitterUrl"),
    linkedinUrl: getStr("linkedinUrl"),
    githubUrl: getStr("githubUrl"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Please enter valid instructor information (e.g. valid URLs/emails)." };
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
