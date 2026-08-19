"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/client";
import { requireAdmin, requireUser } from "@/lib/permissions";
import { reviewSchema } from "@/lib/validations/review";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function submitReview(
  eventId: string,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();

  const registration = await prisma.registration.findUnique({
    where: { userId_eventId: { userId: user.id, eventId } },
  });
  if (
    !registration ||
    (registration.status !== "CONFIRMED" && registration.status !== "COMPLETED")
  ) {
    return { ok: false, error: "You need a confirmed registration to review this Event." };
  }

  const parsed = reviewSchema.safeParse({
    rating: formData.get("rating"),
    comment: formData.get("comment") ?? undefined,
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the review form.",
    };
  }

  await prisma.review.upsert({
    where: { userId_eventId: { userId: user.id, eventId } },
    update: { rating: parsed.data.rating, comment: parsed.data.comment, published: false },
    create: {
      userId: user.id,
      eventId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
  });

  revalidatePath("/dashboard/events");
  return { ok: true };
}

export async function moderateReview(reviewId: string, published: boolean) {
  await requireAdmin();
  const review = await prisma.review.update({
    where: { id: reviewId },
    data: { published },
  });
  revalidatePath(`/admin/events/${review.eventId}`);
}
