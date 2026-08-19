import { prisma } from "@/lib/db/client";

// Ready for the homepage testimonials section to consume once wired —
// see tasklist.md Phase 5 (that section still renders mock data owned by
// a different work-in-progress landing redesign; not touched here).
export function getPublishedTestimonials(limit: number) {
  return prisma.review.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: true, event: true },
  });
}
