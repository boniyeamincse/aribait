"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/permissions";
import { discountSchema } from "@/lib/validations/discount";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function createCoupon(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = discountSchema.safeParse({
    code: formData.get("code"),
    type: formData.get("type"),
    amount: formData.get("amount"),
    startsAt: formData.get("startsAt") ?? undefined,
    expiresAt: formData.get("expiresAt") ?? undefined,
    maxTotalUsage: formData.get("maxTotalUsage") ?? undefined,
    maxPerUserUsage: formData.get("maxPerUserUsage") ?? undefined,
    minPurchaseBdt: formData.get("minPurchaseBdt") || "0",
    maxDiscountBdt: formData.get("maxDiscountBdt") ?? undefined,
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the coupon form.",
    };
  }

  const existing = await prisma.discount.findUnique({
    where: { code: parsed.data.code },
  });
  if (existing) {
    return { ok: false, error: "A coupon with this code already exists." };
  }

  await prisma.discount.create({ data: parsed.data });
  revalidatePath("/admin/discounts");
  return { ok: true };
}

export async function deactivateCoupon(discountId: string) {
  await requireAdmin();
  await prisma.discount.update({
    where: { id: discountId },
    data: { active: false },
  });
  revalidatePath("/admin/discounts");
}

export async function attachDiscountToEvent(
  eventId: string,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const code = String(formData.get("code") ?? "")
    .toUpperCase()
    .trim();
  const discount = await prisma.discount.findUnique({ where: { code } });
  if (!discount) {
    return { ok: false, error: "No coupon with that code." };
  }

  await prisma.discountEvent.upsert({
    where: { discountId_eventId: { discountId: discount.id, eventId } },
    update: {},
    create: { discountId: discount.id, eventId },
  });

  revalidatePath(`/admin/events/${eventId}`);
  return { ok: true };
}
