import { prisma } from "@/lib/db/client";

export async function getStudentProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId, role: "STUDENT" },
  });
}

export async function getStudentRegistrations(userId: string) {
  return prisma.registration.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { event: { select: { title: true, id: true } }, payment: true },
  });
}

export async function getStudentUpcomingSessions(userId: string) {
  const now = new Date();
  return prisma.eventSession.findMany({
    where: {
      startAt: { gte: now },
      status: { in: ["SCHEDULED", "JOIN_OPEN", "LIVE", "RESCHEDULED"] },
      event: { registrations: { some: { userId, status: { in: ["CONFIRMED", "COMPLETED"] } } } },
    },
    orderBy: { startAt: "asc" },
    include: { event: { select: { title: true } } },
  });
}

export async function getStudentPayments(userId: string) {
  return prisma.paymentTransaction.findMany({
    where: { payment: { registration: { userId } } },
    orderBy: { createdAt: "desc" },
    include: { payment: { include: { registration: { include: { event: { select: { title: true } } } } } } },
  });
}

export async function getStudentAttendance(userId: string) {
  return prisma.sessionAttendance.findMany({
    where: { registration: { userId } },
    orderBy: { createdAt: "desc" },
    include: {
      eventSession: { select: { title: true, startAt: true, event: { select: { title: true } } } },
    },
  });
}

export async function getStudentCertificates(userId: string) {
  return prisma.certificate.findMany({
    where: { registration: { userId } },
    orderBy: { issuedAt: "desc" },
    include: { registration: { include: { event: { select: { title: true } } } } },
  });
}

export async function getStudentActivity(userId: string) {
  const [registrations, transactions] = await Promise.all([
    prisma.registration.findMany({
      where: { userId },
      select: { id: true, createdAt: true, event: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.paymentTransaction.findMany({
      where: { payment: { registration: { userId } }, status: { in: ["PAID", "FAILED"] } },
      select: {
        id: true,
        status: true,
        updatedAt: true,
        payment: { select: { registration: { select: { event: { select: { title: true } } } } } },
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
  ]);

  const events = [
    ...registrations.map((r) => ({
      icon: "📝",
      text: `Registered for ${r.event.title}`,
      at: r.createdAt,
    })),
    ...transactions.map((t) => ({
      icon: t.status === "PAID" ? "✅" : "❌",
      text: `Payment ${t.status === "PAID" ? "confirmed" : "failed"} for ${t.payment.registration.event.title}`,
      at: t.updatedAt,
    })),
  ];

  return events.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, 20);
}
