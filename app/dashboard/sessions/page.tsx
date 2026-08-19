import Link from "next/link";

import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function MySessionsPage() {
  const user = await requireUser();
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  const beforeMinutes = settings?.joinWindowBeforeMinutes ?? 20;
  const afterMinutes = settings?.joinWindowAfterMinutes ?? 15;

  const sessions = await prisma.eventSession.findMany({
    where: {
      status: { in: ["SCHEDULED", "JOIN_OPEN", "LIVE", "RESCHEDULED"] },
      event: {
        registrations: { some: { userId: user.id, status: "CONFIRMED" } },
      },
    },
    orderBy: { startAt: "asc" },
    select: {
      id: true,
      title: true,
      startAt: true,
      endAt: true,
      status: true,
      platform: true,
      meetingUrl: true, // presence-checked only, never rendered — see below
      event: { select: { title: true, slug: true } },
      hostInstructor: { select: { name: true } },
    },
  });

  const now = new Date();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">My Sessions</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Upcoming live Sessions from your confirmed Events. Join opens{" "}
        {beforeMinutes} minutes before start and stays open until {afterMinutes}{" "}
        minutes after the scheduled end.
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
        {sessions.map((session) => {
          const opensAt = new Date(
            session.startAt.getTime() - beforeMinutes * 60_000,
          );
          const closesAt = new Date(
            session.endAt.getTime() + afterMinutes * 60_000,
          );
          const canJoin =
            !!session.meetingUrl && now >= opensAt && now <= closesAt;

          return (
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
                <p className="text-muted-foreground">
                  {session.startAt.toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{session.status}</Badge>
                {canJoin ? (
                  <Button
                    size="sm"
                    render={
                      <Link href={`/dashboard/sessions/${session.id}/join`}>
                        Join Live Class
                      </Link>
                    }
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Join not open yet
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
