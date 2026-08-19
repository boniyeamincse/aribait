import { prisma } from "@/lib/db/client";

// Asia/Dhaka is a fixed UTC+6 offset with no DST, so day/month boundaries
// can be computed with plain offset math instead of a timezone library.
const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000;

function dhakaTodayRange() {
  const dhakaNow = new Date(Date.now() + DHAKA_OFFSET_MS);
  const y = dhakaNow.getUTCFullYear();
  const m = dhakaNow.getUTCMonth();
  const d = dhakaNow.getUTCDate();
  return {
    start: new Date(Date.UTC(y, m, d, 0, 0, 0) - DHAKA_OFFSET_MS),
    end: new Date(Date.UTC(y, m, d + 1, 0, 0, 0) - DHAKA_OFFSET_MS),
  };
}

function dhakaMonthRange(monthOffset = 0) {
  const dhakaNow = new Date(Date.now() + DHAKA_OFFSET_MS);
  const y = dhakaNow.getUTCFullYear();
  const m = dhakaNow.getUTCMonth() + monthOffset;
  return {
    start: new Date(Date.UTC(y, m, 1, 0, 0, 0) - DHAKA_OFFSET_MS),
    end: new Date(Date.UTC(y, m + 1, 1, 0, 0, 0) - DHAKA_OFFSET_MS),
  };
}

function dhakaDateKey(date: Date) {
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
}

export async function getKpis() {
  const today = dhakaTodayRange();
  const month = dhakaMonthRange();
  const now = new Date();

  const [
    totalStudents,
    activeEvents,
    todaysSessionsCount,
    upcomingSessionsCount,
    confirmedRegistrations,
    publishedEventsWithCapacity,
    monthlyRevenue,
    paymentCounts,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.event.count({ where: { status: "PUBLISHED" } }),
    prisma.eventSession.count({
      where: { startAt: { gte: today.start, lt: today.end } },
    }),
    prisma.eventSession.count({
      where: {
        startAt: { gte: now },
        status: { in: ["SCHEDULED", "JOIN_OPEN", "LIVE", "RESCHEDULED"] },
      },
    }),
    prisma.registration.count({ where: { status: "CONFIRMED" } }),
    prisma.event.findMany({
      where: { status: "PUBLISHED" },
      select: {
        capacity: true,
        _count: { select: { registrations: { where: { status: "CONFIRMED" } } } },
      },
    }),
    prisma.payment.aggregate({
      where: { status: "PAID", createdAt: { gte: month.start, lt: month.end } },
      _sum: { amountBdt: true },
    }),
    prisma.paymentTransaction.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const availableSeats = publishedEventsWithCapacity.reduce((sum, event) => {
    if (event.capacity === null) return sum;
    return sum + Math.max(0, event.capacity - event._count.registrations);
  }, 0);

  const paidCount = paymentCounts.find((p) => p.status === "PAID")?._count._all ?? 0;
  const failedCount = paymentCounts.find((p) => p.status === "FAILED")?._count._all ?? 0;
  const pendingCount = paymentCounts.find((p) => p.status === "PENDING")?._count._all ?? 0;
  const decided = paidCount + failedCount;
  const paymentSuccessRatePct = decided ? Math.round((paidCount / decided) * 100) : null;

  return {
    totalStudents,
    activeEvents,
    todaysSessionsCount,
    upcomingSessionsCount,
    confirmedRegistrations,
    availableSeats,
    monthlyRevenueBdt: monthlyRevenue._sum.amountBdt ?? 0,
    paymentSuccessRatePct,
    pendingPaymentsCount: pendingCount,
  };
}

export async function getActionRequired() {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    pendingPayments,
    sessionsWithoutLinks,
    waitlistedStudents,
    completedRegistrationsWithoutCertificate,
    nearlyFullEvents,
  ] = await Promise.all([
    prisma.paymentTransaction.count({ where: { status: "PENDING" } }),
    prisma.eventSession.count({
      where: {
        startAt: { gte: now, lte: sevenDaysFromNow },
        status: { in: ["SCHEDULED", "JOIN_OPEN"] },
        meetingUrl: null,
      },
    }),
    prisma.registration.count({ where: { status: "WAITLISTED" } }),
    prisma.registration.count({
      where: { status: "COMPLETED", certificate: null },
    }),
    prisma.event.findMany({
      where: { status: "PUBLISHED", capacity: { not: null } },
      select: {
        id: true,
        title: true,
        capacity: true,
        _count: { select: { registrations: { where: { status: "CONFIRMED" } } } },
      },
    }),
  ]);

  const nearlyFullCount = nearlyFullEvents.filter(
    (e) => e.capacity !== null && e._count.registrations / e.capacity >= 0.8,
  ).length;

  const items: {
    label: string;
    href: string;
    urgency: "high" | "medium" | "low";
  }[] = [];

  if (pendingPayments > 0) {
    items.push({
      label: `${pendingPayments} payment${pendingPayments === 1 ? "" : "s"} awaiting review`,
      href: "/admin/payments",
      urgency: "high",
    });
  }
  if (sessionsWithoutLinks > 0) {
    items.push({
      label: `${sessionsWithoutLinks} upcoming session${sessionsWithoutLinks === 1 ? "" : "s"} missing a meeting link`,
      href: "/admin/sessions",
      urgency: "high",
    });
  }
  if (completedRegistrationsWithoutCertificate > 0) {
    items.push({
      label: `${completedRegistrationsWithoutCertificate} certificate${completedRegistrationsWithoutCertificate === 1 ? "" : "s"} ready to issue`,
      href: "/admin/certificates",
      urgency: "medium",
    });
  }
  if (nearlyFullCount > 0) {
    items.push({
      label: `${nearlyFullCount} event${nearlyFullCount === 1 ? "" : "s"} nearly full (80%+ capacity)`,
      href: "/admin/events",
      urgency: "low",
    });
  }
  if (waitlistedStudents > 0) {
    items.push({
      label: `${waitlistedStudents} student${waitlistedStudents === 1 ? "" : "s"} on a waitlist`,
      href: "/admin/registrations",
      urgency: "low",
    });
  }

  return items;
}

export async function getTodaysSessions() {
  const today = dhakaTodayRange();
  const sessions = await prisma.eventSession.findMany({
    where: { startAt: { gte: today.start, lt: today.end } },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          _count: { select: { registrations: { where: { status: "CONFIRMED" } } } },
        },
      },
      hostInstructor: { select: { name: true } },
    },
    orderBy: { startAt: "asc" },
  });

  return sessions.map((s) => ({
    id: s.id,
    title: s.title,
    eventTitle: s.event.title,
    eventId: s.event.id,
    startAt: s.startAt,
    platform: s.platform,
    status: s.status,
    hasMeetingLink: !!s.meetingUrl,
    confirmedStudents: s.event._count.registrations,
  }));
}

export async function getUpcomingSessions(days = 7) {
  const now = new Date();
  const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const sessions = await prisma.eventSession.findMany({
    where: {
      startAt: { gt: now, lte: end },
      status: { in: ["SCHEDULED", "JOIN_OPEN", "RESCHEDULED"] },
    },
    include: {
      event: {
        select: {
          title: true,
          _count: { select: { registrations: { where: { status: "CONFIRMED" } } } },
        },
      },
      hostInstructor: { select: { name: true } },
    },
    orderBy: { startAt: "asc" },
    take: 15,
  });

  return sessions.map((s) => ({
    id: s.id,
    title: s.title,
    eventTitle: s.event.title,
    instructorName: s.hostInstructor?.name ?? "Unassigned",
    startAt: s.startAt,
    confirmedStudents: s.event._count.registrations,
    hasMeetingLink: !!s.meetingUrl,
    status: s.status,
  }));
}

export async function getRegistrationTrend(days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const registrations = await prisma.registration.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
  });

  const counts = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const key = dhakaDateKey(new Date(Date.now() - i * 24 * 60 * 60 * 1000));
    counts.set(key, 0);
  }
  for (const r of registrations) {
    const key = dhakaDateKey(r.createdAt);
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([date, count]) => ({ date, count }));
}

export async function getRevenueTrend() {
  const current = dhakaMonthRange(0);
  const previous = dhakaMonthRange(-1);

  const [currentSum, previousSum] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: "PAID", createdAt: { gte: current.start, lt: current.end } },
      _sum: { amountBdt: true },
    }),
    prisma.payment.aggregate({
      where: { status: "PAID", createdAt: { gte: previous.start, lt: previous.end } },
      _sum: { amountBdt: true },
    }),
  ]);

  return [
    { label: "Last month", revenueBdt: previousSum._sum.amountBdt ?? 0 },
    { label: "This month", revenueBdt: currentSum._sum.amountBdt ?? 0 },
  ];
}

export async function getRecentActivity(limit = 15) {
  const [auditLogs, registrations, paidTransactions] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { actor: { select: { name: true, email: true } } },
    }),
    prisma.registration.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { user: { select: { name: true, email: true } }, event: { select: { title: true } } },
    }),
    prisma.paymentTransaction.findMany({
      where: { status: { in: ["PAID", "FAILED"] } },
      orderBy: { updatedAt: "desc" },
      take: limit,
      include: {
        payment: {
          include: {
            registration: {
              include: { user: { select: { name: true, email: true } }, event: { select: { title: true } } },
            },
          },
        },
      },
    }),
  ]);

  const events: { text: string; at: Date }[] = [
    ...auditLogs.map((a) => ({
      text: `${a.actor.name ?? a.actor.email}: ${a.summary}`,
      at: a.createdAt,
    })),
    ...registrations.map((r) => ({
      text: `${r.user.name ?? r.user.email} registered for ${r.event.title}`,
      at: r.createdAt,
    })),
    ...paidTransactions.map((t) => ({
      text: `Payment ${t.status === "PAID" ? "confirmed" : "failed"} — ${t.payment.registration.user.name ?? t.payment.registration.user.email} for ${t.payment.registration.event.title}`,
      at: t.updatedAt,
    })),
  ];

  return events.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, limit);
}
