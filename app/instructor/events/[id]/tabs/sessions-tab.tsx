import { createInstructorEventSession } from "@/lib/instructors/session-actions";
import type { Event, EventSession, Instructor } from "@/lib/generated/prisma/client";
import { Badge } from "@/components/ui/badge";

import { SessionForm } from "@/app/admin/events/[id]/session-form";

type EventWithSessions = Event & { sessions: EventSession[] };

const EDITABLE_STATUSES = ["DRAFT", "CHANGES_REQUESTED"];

export function SessionsTab({
  event,
  instructor,
}: {
  event: EventWithSessions;
  instructor: Instructor;
}) {
  const nextSequence = event.sessions.length + 1;
  const editable = EDITABLE_STATUSES.includes(event.status);
  const hostOptions = [{ id: instructor.id, name: instructor.name }];

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
            <Badge variant="secondary">{session.status}</Badge>
          </div>
        ))}
      </div>

      {editable ? (
        <div className="rounded-lg border border-slate-200 p-4">
          <h3 className="mb-3 text-sm font-medium text-slate-900">Add Session</h3>
          <SessionForm
            action={createInstructorEventSession.bind(null, event.id)}
            instructors={hostOptions}
            nextSequence={nextSequence}
            submitLabel="Add Session"
            defaultValues={{
              title: "",
              sequence: nextSequence,
              description: null,
              startAt: event.startAt,
              endAt: event.endAt,
              timeZone: "Asia/Dhaka",
              hostInstructorId: instructor.id,
              platform: "ZOOM",
              meetingId: null,
              meetingUrl: null,
              meetingPasscode: null,
            }}
          />
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          Sessions can only be added or edited while the Event is a Draft.
        </p>
      )}
    </div>
  );
}
