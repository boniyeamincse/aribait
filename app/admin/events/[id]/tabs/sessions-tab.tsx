import Link from "next/link";

import { createEventSession, cancelEventSession, reactivateEventSession } from "@/lib/events/session-actions";
import type { Instructor, Prisma } from "@/lib/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { SessionForm } from "../session-form";

type EventWithSessions = Prisma.EventGetPayload<{ include: { sessions: true } }>;

export function SessionsTab({
  event,
  instructors,
}: {
  event: EventWithSessions;
  instructors: Instructor[];
}) {
  const nextSequence = event.sessions.length + 1;

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <div className="flex flex-col divide-y divide-slate-200 rounded-lg border border-slate-200">
        {event.sessions.length === 0 && (
          <p className="p-4 text-sm text-slate-500">No Sessions yet — add the first one below.</p>
        )}
        {event.sessions.map((session) => (
          <div key={session.id} className="flex items-center justify-between gap-4 p-3 text-sm">
            <div>
              <p className="font-medium text-slate-900">
                {session.sequence}. {session.title}
              </p>
              <p className="text-slate-500">
                {session.startAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })} ·{" "}
                {session.platform}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{session.status}</Badge>
              <Button
                render={<Link href={`/admin/events/${event.id}/sessions/${session.id}`}>Edit</Link>}
                nativeButton={false}
                size="sm"
                variant="outline"
              />
              {session.status !== "CANCELLED" ? (
                <form action={cancelEventSession.bind(null, session.id)}>
                  <Button type="submit" size="sm" variant="destructive">
                    Cancel
                  </Button>
                </form>
              ) : (
                <form action={reactivateEventSession.bind(null, session.id)}>
                  <Button type="submit" size="sm">
                    Activate
                  </Button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 p-4">
        <h3 className="mb-3 text-sm font-medium text-slate-900">Add Session</h3>
        <SessionForm
          key={nextSequence}
          action={createEventSession.bind(null, event.id)}
          instructors={instructors}
          nextSequence={nextSequence}
          submitLabel="Add Session"
          defaultValues={{
            title: "",
            sequence: nextSequence,
            description: null,
            startAt: event.startAt,
            endAt: event.endAt,
            timeZone: "Asia/Dhaka",
            hostInstructorId: event.instructorId,
            platform: "ZOOM",
            meetingId: null,
            meetingUrl: null,
            meetingPasscode: null,
          }}
        />
      </div>
    </div>
  );
}
