import { prisma } from "@/lib/db/client";

export async function getRegistrationsByEvent() {
  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          registrations: true,
        },
      },
    },
  });

  const statusCounts = await prisma.registration.groupBy({
    by: ["eventId", "status"],
    _count: { _all: true },
  });

  return events.map((event) => {
    const forEvent = statusCounts.filter((s) => s.eventId === event.id);
    const byStatus = (status: string) =>
      forEvent.find((s) => s.status === status)?._count._all ?? 0;
    return {
      eventId: event.id,
      title: event.title,
      priceBdt: event.priceBdt,
      total: event._count.registrations,
      confirmed: byStatus("CONFIRMED"),
      waitlisted: byStatus("WAITLISTED"),
      cancelled: byStatus("CANCELLED"),
      completed: byStatus("COMPLETED"),
    };
  });
}

export async function getPricingSplit() {
  const [free, paid] = await Promise.all([
    prisma.registration.count({ where: { event: { priceBdt: 0 }, status: "CONFIRMED" } }),
    prisma.registration.count({ where: { event: { priceBdt: { gt: 0 } }, status: "CONFIRMED" } }),
  ]);
  return { free, paid };
}

export async function getRevenueByEvent() {
  const payments = await prisma.payment.findMany({
    where: { status: "PAID" },
    include: { registration: { include: { event: true } } },
  });
  const byEvent = new Map<string, { title: string; revenueBdt: number; count: number }>();
  for (const payment of payments) {
    const key = payment.registration.eventId;
    const existing = byEvent.get(key) ?? {
      title: payment.registration.event.title,
      revenueBdt: 0,
      count: 0,
    };
    existing.revenueBdt += payment.amountBdt;
    existing.count += 1;
    byEvent.set(key, existing);
  }
  return Array.from(byEvent.values()).sort((a, b) => b.revenueBdt - a.revenueBdt);
}

export async function getPaymentSuccessRate() {
  const grouped = await prisma.paymentTransaction.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const byStatus = (status: string) =>
    grouped.find((g) => g.status === status)?._count._all ?? 0;
  return {
    paid: byStatus("PAID"),
    failed: byStatus("FAILED"),
    pending: byStatus("PENDING"),
  };
}

export async function getDiscountUsage() {
  const discounts = await prisma.discount.findMany({
    include: { _count: { select: { redemptions: true } }, redemptions: true },
  });
  return discounts.map((d) => ({
    code: d.code,
    active: d.active,
    redemptions: d._count.redemptions,
    totalDiscountBdt: d.redemptions.reduce((sum, r) => sum + r.discountAmountBdt, 0),
  }));
}

export async function getAttendanceCompletion() {
  const events = await prisma.event.findMany({
    where: { status: "COMPLETED" },
    include: {
      registrations: {
        where: { status: { in: ["COMPLETED", "CONFIRMED"] } },
        include: { attendances: true },
      },
    },
  });

  return events.map((event) => {
    const totalRegs = event.registrations.length;
    const completedRegs = event.registrations.filter((r) => r.status === "COMPLETED").length;
    const presentMarks = event.registrations.filter((r) =>
      r.attendances.some((a) => a.status === "PRESENT" || a.status === "LATE"),
    ).length;
    return {
      title: event.title,
      totalRegistrations: totalRegs,
      completionRatePct: totalRegs ? Math.round((completedRegs / totalRegs) * 100) : 0,
      attendanceRatePct: totalRegs ? Math.round((presentMarks / totalRegs) * 100) : 0,
    };
  });
}

export async function getCertificateIssuance() {
  const [issued, revoked] = await Promise.all([
    prisma.certificate.count({ where: { status: "ISSUED" } }),
    prisma.certificate.count({ where: { status: "REVOKED" } }),
  ]);
  return { issued, revoked };
}

export async function getInstructorPerformance() {
  const instructors = await prisma.instructor.findMany({
    include: {
      events: {
        include: {
          _count: { select: { registrations: true } },
          reviews: { where: { published: true } },
        },
      },
    },
  });

  return instructors.map((instructor) => {
    const eventCount = instructor.events.length;
    const registrationCount = instructor.events.reduce(
      (sum, e) => sum + e._count.registrations,
      0,
    );
    const ratings = instructor.events.flatMap((e) => e.reviews.map((r) => r.rating));
    const avgRating = ratings.length
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : null;
    return {
      name: instructor.name,
      eventCount,
      registrationCount,
      avgRating,
    };
  });
}
