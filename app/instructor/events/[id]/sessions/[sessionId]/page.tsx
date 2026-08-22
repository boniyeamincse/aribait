import Link from "next/link";
import { notFound } from "next/navigation";

import { requireOwnedEvent } from "@/lib/instructors/ownership";
import { prisma } from "@/lib/db/client";
import { updateInstructorEventSession } from "@/lib/instructors/session-actions";
import { Button } from "@/components/ui/button";

import { SessionForm } from "@/app/admin/events/[id]/session-form";

export default async function InstructorEditSessionPage(
  props: PageProps<"/instructor/events/[id]/sessions/[sessionId]">,
) {
  const { id, sessionId } = await props.params;
  const { instructor, event } = await requireOwnedEvent(id);

  const session = await prisma.eventSession.findUnique({ where: { id: sessionId } });
  if (!session || session.eventId !== id) notFound();

  const editable = event.status === "DRAFT" || event.status === "CHANGES_REQUESTED";

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Edit Session</h1>
        <Button
          variant="outline"
          size="sm"
          render={<Link href={`/instructor/events/${id}?tab=sessions`}>Back to Event</Link>}
          nativeButton={false}
        />
      </div>

      {editable ? (
        <SessionForm
          action={updateInstructorEventSession.bind(null, session.id)}
          instructors={[{ id: instructor.id, name: instructor.name }]}
          nextSequence={session.sequence}
          submitLabel="Save changes"
          defaultValues={{
            title: session.title,
            sequence: session.sequence,
            description: session.description,
            startAt: session.startAt,
            endAt: session.endAt,
            timeZone: session.timeZone,
            hostInstructorId: session.hostInstructorId,
            platform: session.platform,
            meetingId: session.meetingId,
            meetingUrl: session.meetingUrl,
            meetingPasscode: session.meetingPasscode,
          }}
        />
      ) : (
        <p className="text-sm text-slate-500">
          Sessions can only be edited while the Event is a Draft or Changes Requested.
        </p>
      )}
    </div>
  );
}
