import Link from "next/link";

import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";

export default async function MySessionsPage() {
  const user = await requireUser();

  const sessions = await prisma.eventSession.findMany({
    where: {
      status: { in: ["SCHEDULED", "JOIN_OPEN", "LIVE", "RESCHEDULED"] },
      event: {
        registrations: { some: { userId: user.id, status: "CONFIRMED" } },
      },
    },
    orderBy: { startAt: "asc" },
    include: { event: true, hostInstructor: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">My Sessions</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Upcoming live Sessions from your confirmed Events. Join links open
        20 minutes before start once Phase 4 ships.
      </p>
      <div className="mt-6 divide-y rounded-lg border">
        {sessions.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">
            No upcoming Sessions.{" "}
            <Link href="/events" className="underline underline-offset-4">
              Browse Events
            </Link>
            .
          </p>
        )}
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between gap-4 p-4 text-sm"
          >
            <div>
              <p className="font-medium">
                {session.event.title} — {session.title}
              </p>
              <p className="text-muted-foreground">
                {session.hostInstructor?.name} · {session.platform}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{session.status}</Badge>
              <p className="text-muted-foreground">
                {session.startAt.toLocaleString("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
