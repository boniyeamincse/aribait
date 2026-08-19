import Link from "next/link";

import { prisma } from "@/lib/db/client";

export default async function SchedulePage() {
  const sessions = await prisma.eventSession.findMany({
    where: {
      status: { in: ["SCHEDULED", "JOIN_OPEN", "LIVE", "RESCHEDULED"] },
      startAt: { gte: new Date() },
      event: { status: "PUBLISHED" },
    },
    orderBy: { startAt: "asc" },
    take: 100,
    include: { event: true, hostInstructor: true },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Schedule</h1>
      <p className="mt-2 text-muted-foreground">
        Upcoming live Sessions across all published Events.
      </p>

      <div className="mt-8 divide-y rounded-lg border">
        {sessions.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">
            No upcoming Sessions scheduled.
          </p>
        )}
        {sessions.map((session) => (
          <Link
            key={session.id}
            href={`/events/${session.event.slug}`}
            className="flex items-center justify-between gap-4 p-4 text-sm hover:bg-accent"
          >
            <div>
              <p className="font-medium">
                {session.event.title} — {session.title}
              </p>
              <p className="text-muted-foreground">
                {session.hostInstructor?.name} · {session.platform}
              </p>
            </div>
            <p className="text-muted-foreground">
              {session.startAt.toLocaleString("en-GB", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
