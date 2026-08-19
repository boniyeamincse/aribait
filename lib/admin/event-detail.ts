import { prisma } from "@/lib/db/client";

export async function getEventRegistrations(eventId: string) {
  return prisma.registration.findMany({
    where: { eventId },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } }, payment: true },
  });
}

export async function getEventPaymentTransactions(eventId: string) {
  return prisma.paymentTransaction.findMany({
    where: { payment: { registration: { eventId } } },
    orderBy: { createdAt: "desc" },
    include: {
      payment: { include: { registration: { include: { user: { select: { name: true, email: true } } } } } },
    },
  });
}

export async function getEventAttendanceSummary(eventId: string) {
  const sessions = await prisma.eventSession.findMany({
    where: { eventId },
    orderBy: { sequence: "asc" },
    include: {
      attendances: { select: { status: true } },
      _count: { select: { attendances: true } },
    },
  });

  return sessions.map((s) => ({
    id: s.id,
    title: s.title,
    sequence: s.sequence,
    startAt: s.startAt,
    status: s.status,
    totalMarked: s._count.attendances,
    present: s.attendances.filter((a) => a.status === "PRESENT" || a.status === "LATE").length,
  }));
}

export async function getEventCertificates(eventId: string) {
  return prisma.certificate.findMany({
    where: { registration: { eventId } },
    orderBy: { issuedAt: "desc" },
    include: { registration: { include: { user: { select: { name: true, email: true } } } } },
  });
}

export async function getEventNotifications(eventId: string) {
  return prisma.notification.findMany({
    where: { eventId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { name: true, email: true } } },
  });
}

export async function getEventActivityLog(eventId: string) {
  const [sessions, registrations] = await Promise.all([
    prisma.eventSession.findMany({ where: { eventId }, select: { id: true } }),
    prisma.registration.findMany({
      where: { eventId },
      select: {
        id: true,
        payment: { select: { transactions: { select: { id: true } } } },
        certificate: { select: { id: true } },
      },
    }),
  ]);

  const sessionIds = sessions.map((s) => s.id);
  const transactionIds = registrations.flatMap((r) => r.payment?.transactions.map((t) => t.id) ?? []);
  const certificateIds = registrations.flatMap((r) => (r.certificate ? [r.certificate.id] : []));
  const attendanceTargetIds = registrations.flatMap((r) => sessionIds.map((sid) => `${r.id}:${sid}`));

  const targetIds = [eventId, ...sessionIds, ...transactionIds, ...certificateIds, ...attendanceTargetIds];
  if (targetIds.length === 0) return [];

  return prisma.auditLog.findMany({
    where: { targetId: { in: targetIds } },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { actor: { select: { name: true, email: true } } },
  });
}
