import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/client";

// Advances SCHEDULED -> JOIN_OPEN -> LIVE -> COMPLETED based on the join
// window. Ordered most-progressed-first isn't required — each step re-reads
// current status, so an overdue Session cascades through every applicable
// transition in one run instead of needing multiple cron ticks.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  const beforeMinutes = settings?.joinWindowBeforeMinutes ?? 20;
  const afterMinutes = settings?.joinWindowAfterMinutes ?? 15;
  const now = new Date();

  const joinOpen = await prisma.eventSession.updateMany({
    where: {
      status: "SCHEDULED",
      startAt: { lte: new Date(now.getTime() + beforeMinutes * 60_000) },
    },
    data: { status: "JOIN_OPEN" },
  });

  const live = await prisma.eventSession.updateMany({
    where: {
      status: { in: ["SCHEDULED", "JOIN_OPEN"] },
      startAt: { lte: now },
    },
    data: { status: "LIVE" },
  });

  const completed = await prisma.eventSession.updateMany({
    where: {
      status: { in: ["SCHEDULED", "JOIN_OPEN", "LIVE"] },
      endAt: { lte: new Date(now.getTime() - afterMinutes * 60_000) },
    },
    data: { status: "COMPLETED" },
  });

  return NextResponse.json({
    joinOpen: joinOpen.count,
    live: live.count,
    completed: completed.count,
  });
}
