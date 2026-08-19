"use server";

import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/db/client";

export type SearchResultGroup = {
  label: string;
  items: { id: string; title: string; href: string; detail?: string }[];
};

export async function globalSearch(query: string): Promise<SearchResultGroup[]> {
  await requireAdmin();
  if (!query || query.length < 2) return [];

  const results: SearchResultGroup[] = [];
  const searchStr = `%${query}%`;

  // 1. Events
  const events = await prisma.event.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { id: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 5,
    select: { id: true, title: true, type: true },
  });
  if (events.length > 0) {
    results.push({
      label: "Events",
      items: events.map((e) => ({
        id: e.id,
        title: e.title,
        detail: e.type,
        href: `/admin/events/${e.id}`,
      })),
    });
  }

  // 2. Sessions
  const sessions = await prisma.eventSession.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { meetingId: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 5,
    select: { id: true, title: true, eventId: true },
  });
  if (sessions.length > 0) {
    results.push({
      label: "Sessions",
      items: sessions.map((s) => ({
        id: s.id,
        title: s.title,
        href: `/admin/events/${s.eventId}/sessions/${s.id}`,
      })),
    });
  }

  // 3. Students (Users with role STUDENT)
  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 5,
    select: { id: true, name: true, email: true },
  });
  if (students.length > 0) {
    results.push({
      label: "Students",
      items: students.map((s) => ({
        id: s.id,
        title: s.name || "Unknown",
        detail: s.email,
        href: `/admin/students/${s.id}`,
      })),
    });
  }

  // 4. Registrations
  const registrations = await prisma.registration.findMany({
    where: { id: { contains: query, mode: "insensitive" } },
    take: 5,
    include: { user: true, event: true },
  });
  if (registrations.length > 0) {
    results.push({
      label: "Registrations",
      items: registrations.map((r) => ({
        id: r.id,
        title: `Reg: ${r.id}`,
        detail: `${r.user.name} - ${r.event.title}`,
        href: `/admin/registrations`,
      })),
    });
  }

  // 5. Payment Transactions
  const txs = await prisma.paymentTransaction.findMany({
    where: { trxId: { contains: query, mode: "insensitive" } },
    take: 5,
    include: { payment: { include: { registration: { include: { user: true } } } } },
  });
  if (txs.length > 0) {
    results.push({
      label: "Transactions",
      items: txs.map((tx) => ({
        id: tx.id,
        title: tx.trxId,
        detail: `${tx.method} - ${tx.payment.registration.user.name}`,
        href: `/admin/payments`,
      })),
    });
  }

  // 6. Coupons
  const coupons = await prisma.discount.findMany({
    where: { code: { contains: query, mode: "insensitive" } },
    take: 5,
  });
  if (coupons.length > 0) {
    results.push({
      label: "Coupons",
      items: coupons.map((c) => ({
        id: c.id,
        title: c.code,
        detail: `${c.amount}${c.type === "PERCENTAGE" ? "%" : " BDT"} off`,
        href: `/admin/discounts`,
      })),
    });
  }

  // 7. Certificates
  const certs = await prisma.certificate.findMany({
    where: { certificateNumber: { contains: query, mode: "insensitive" } },
    take: 5,
    include: { registration: { include: { user: true } } },
  });
  if (certs.length > 0) {
    results.push({
      label: "Certificates",
      items: certs.map((c) => ({
        id: c.id,
        title: c.certificateNumber,
        detail: c.registration.user.name || "Unknown",
        href: `/admin/certificates`,
      })),
    });
  }

  return results;
}
