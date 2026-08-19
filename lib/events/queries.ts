import { prisma } from "@/lib/db/client";
import type { Prisma } from "@/lib/generated/prisma/client";

export type EventListFilters = {
  q?: string;
  categoryId?: string;
  instructorId?: string;
  type?: string;
  pricing?: "free" | "paid";
  sort?: "newest" | "upcoming" | "popular" | "price";
};

export function listPublishedEvents(filters: EventListFilters) {
  const where: Prisma.EventWhereInput = {
    status: "PUBLISHED",
    ...(filters.q && {
      OR: [
        { title: { contains: filters.q, mode: "insensitive" } },
        { shortDescription: { contains: filters.q, mode: "insensitive" } },
      ],
    }),
    ...(filters.categoryId && { categoryId: filters.categoryId }),
    ...(filters.instructorId && { instructorId: filters.instructorId }),
    ...(filters.type && { type: filters.type as Prisma.EnumEventTypeFilter["equals"] }),
    ...(filters.pricing === "free" && { priceBdt: 0 }),
    ...(filters.pricing === "paid" && { priceBdt: { gt: 0 } }),
  };

  const orderBy: Prisma.EventOrderByWithRelationInput =
    filters.sort === "upcoming"
      ? { startAt: "asc" }
      : filters.sort === "price"
        ? { priceBdt: "asc" }
        : filters.sort === "popular"
          ? { registrations: { _count: "desc" } }
          : { createdAt: "desc" };

  return prisma.event.findMany({
    where,
    orderBy,
    take: 60,
    include: { category: true, instructor: true },
  });
}

// Meeting URL/passcode/meetingId are deliberately excluded from this select —
// public Event pages must never receive them (docs/security.md §4).
export function getPublishedEventBySlug(slug: string) {
  return prisma.event.findFirst({
    where: { slug, status: { not: "DRAFT" } },
    include: {
      category: true,
      instructor: true,
      sessions: {
        orderBy: { sequence: "asc" },
        select: {
          id: true,
          title: true,
          sequence: true,
          description: true,
          startAt: true,
          endAt: true,
          timeZone: true,
          platform: true,
          status: true,
          hostInstructor: { select: { name: true } },
        },
      },
      _count: { select: { registrations: { where: { status: "CONFIRMED" } } } },
    },
  });
}
