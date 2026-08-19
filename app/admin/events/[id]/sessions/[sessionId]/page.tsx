import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/db/client";
import { updateEventSession } from "@/lib/events/session-actions";
import { Button } from "@/components/ui/button";

import { SessionForm } from "../../session-form";

export default async function AdminEditSessionPage({
  params,
}: PageProps<"/admin/events/[id]/sessions/[sessionId]">) {
  const { id, sessionId } = await params;

  const [session, instructors] = await Promise.all([
    prisma.eventSession.findUnique({ where: { id: sessionId } }),
    prisma.instructor.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!session || session.eventId !== id) notFound();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          Edit Session
        </h1>
        <Button
          variant="outline"
          size="sm"
          render={<Link href={`/admin/events/${id}`}>Back to Event</Link>}
        />
      </div>

      <SessionForm
        action={updateEventSession.bind(null, session.id)}
        instructors={instructors}
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
    </div>
  );
}
