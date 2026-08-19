import { prisma } from "@/lib/db/client";

type ValidateCouponResult =
  | { ok: true; discountId: string; discountAmountBdt: number }
  | { ok: false; error: string };

/**
 * Server-only helper (not a Server Action) — called from startPaidCheckout.
 * Empty `discount.events` means the coupon applies sitewide.
 */
export async function validateCoupon(
  code: string,
  eventId: string,
  userId: string,
  priceBdt: number,
): Promise<ValidateCouponResult> {
  const discount = await prisma.discount.findUnique({
    where: { code: code.toUpperCase().trim() },
    include: { events: true },
  });

  if (!discount || !discount.active) {
    return { ok: false, error: "This coupon code is not valid." };
  }

  const now = new Date();
  if (discount.startsAt && now < discount.startsAt) {
    return { ok: false, error: "This coupon isn't active yet." };
  }
  if (discount.expiresAt && now > discount.expiresAt) {
    return { ok: false, error: "This coupon has expired." };
  }

  if (
    discount.events.length > 0 &&
    !discount.events.some((e) => e.eventId === eventId)
  ) {
    return { ok: false, error: "This coupon doesn't apply to this Event." };
  }

  if (priceBdt < discount.minPurchaseBdt) {
    return {
      ok: false,
      error: `This coupon requires a minimum purchase of ৳${discount.minPurchaseBdt}.`,
    };
  }

  if (discount.maxTotalUsage !== null) {
    const totalUsed = await prisma.discountRedemption.count({
      where: { discountId: discount.id },
    });
    if (totalUsed >= discount.maxTotalUsage) {
      return { ok: false, error: "This coupon has reached its usage limit." };
    }
  }

  if (discount.maxPerUserUsage !== null) {
    const usedByUser = await prisma.discountRedemption.count({
      where: { discountId: discount.id, userId },
    });
    if (usedByUser >= discount.maxPerUserUsage) {
      return {
        ok: false,
        error: "You've already used this coupon the maximum number of times.",
      };
    }
  }

  const rawDiscount =
    discount.type === "PERCENTAGE"
      ? Math.floor((priceBdt * discount.amount) / 100)
      : discount.amount;
  const cappedDiscount =
    discount.maxDiscountBdt !== null
      ? Math.min(rawDiscount, discount.maxDiscountBdt)
      : rawDiscount;
  const discountAmountBdt = Math.min(cappedDiscount, priceBdt);

  return { ok: true, discountId: discount.id, discountAmountBdt };
}
