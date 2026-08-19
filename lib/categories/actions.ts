"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/permissions";
import { categorySchema } from "@/lib/validations/category";
import { slugify } from "@/lib/utils";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function createCategory(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = categorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { ok: false, error: "Enter a category name (2-80 characters)." };
  }

  const slug = slugify(parsed.data.name);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    return { ok: false, error: "A category with this name already exists." };
  }

  await prisma.category.create({ data: { name: parsed.data.name, slug } });
  revalidatePath("/admin/categories");
  return { ok: true };
}
