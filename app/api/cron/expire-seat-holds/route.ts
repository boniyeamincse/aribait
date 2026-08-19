import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/client";

// Releases paid-checkout seat holds past their expiry, expiring the
// PENDING_PAYMENT registration and payment they belong to. Runs on a
// schedule (Vercel Cron in production); see docs/deployment.md §5.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const expiredHolds = await prisma.seatHold.findMany({
    where: { status: "HELD", expiresAt: { lt: now } },
    select: { id: true, registrationId: true },
  });

  for (const hold of expiredHolds) {
    await prisma.$transaction([
      prisma.seatHold.update({
        where: { id: hold.id },
        data: { status: "EXPIRED" },
      }),
      prisma.registration.update({
        where: { id: hold.registrationId },
        data: { status: "EXPIRED" },
      }),
      prisma.payment.updateMany({
        where: {
          registrationId: hold.registrationId,
          status: { in: ["INITIATED", "PENDING"] },
        },
        data: { status: "CANCELLED" },
      }),
    ]);
  }

  return NextResponse.json({ expired: expiredHolds.length });
}
