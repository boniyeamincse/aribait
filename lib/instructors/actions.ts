"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/permissions";
import { instructorSchema } from "@/lib/validations/instructor";
import { hashPassword } from "@/lib/security/password";
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
