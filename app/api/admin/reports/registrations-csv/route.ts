import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/permissions";

function csvCell(value: string | number) {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export async function GET() {
  await requireAdmin();

  const registrations = await prisma.registration.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, event: true },
  });

  const header = [
    "Registration ID",
    "Event",
    "Student name",
    "Student email",
    "Status",
    "Price (BDT)",
    "Discount (BDT)",
    "Coupon",
    "Registered at",
  ];
  const rows = registrations.map((r) => [
    r.id,
    r.event.title,
    r.user.name ?? "",
    r.user.email,
    r.status,
    r.priceSnapshotBdt,
    r.discountAmountSnapshotBdt,
    r.couponCodeSnapshot ?? "",
    r.createdAt.toISOString(),
  ]);

  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="registrations.csv"`,
    },
  });
}
