import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/db/client";
import {
  archiveEvent,
  cancelEvent,
  completeEvent,
  publishEvent,
  updateEvent,
} from "@/lib/events/actions";
import { createEventSession, cancelEventSession } from "@/lib/events/session-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatBdt } from "@/lib/utils";

import { EventForm } from "../event-form";
import { SessionForm } from "./session-form";
import { AttachCouponForm } from "./attach-coupon-form";
import { AnnouncementForm } from "./announcement-form";

export default async function AdminEventDetailPage({
  params,
}: PageProps<"/admin/events/[id]">) {
  const { id } = await params;

  const [event, categories, instructors] = await Promise.all([
    prisma.event.findUnique({
      where: { id },
      include: {
        sessions: { orderBy: { sequence: "asc" } },
        discountEvents: { include: { discount: true } },
        _count: { select: { registrations: true } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.instructor.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!event) notFound();

  const nextSequence = event.sessions.length + 1;

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {event.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            /events/{event.slug} · {formatBdt(event.priceBdt)} ·{" "}
            {event._count.registrations} registration
            {event._count.registrations === 1 ? "" : "s"}
          </p>
        </div>
        <Badge variant="secondary">{event.status}</Badge>
      </div>

      <div className="flex gap-2">
        {event.status === "DRAFT" && (
          <form action={publishEvent.bind(null, event.id)}>
            <Button type="submit" size="sm">
              Publish
            </Button>
          </form>
        )}
        {event.status !== "CANCELLED" && event.status !== "ARCHIVED" && (
          <form action={cancelEvent.bind(null, event.id)}>
            <Button type="submit" size="sm" variant="destructive">
              Cancel Event
            </Button>
          </form>
        )}
        {event.status !== "ARCHIVED" && (
          <form action={archiveEvent.bind(null, event.id)}>
            <Button type="submit" size="sm" variant="outline">
              Archive
            </Button>
          </form>
        )}
        {event.status === "PUBLISHED" && (
          <form action={completeEvent.bind(null, event.id)}>
            <Button type="submit" size="sm" variant="outline">
              Complete Event
            </Button>
          </form>
        )}
      </div>

      <Separator />

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Edit Event</h2>
        <EventForm
          action={updateEvent.bind(null, event.id)}
          categories={categories}
          instructors={instructors}
          submitLabel="Save changes"
          defaultValues={{
            title: event.title,
            shortDescription: event.shortDescription,
            description: event.description,
            type: event.type,
            categoryId: event.categoryId,
            instructorId: event.instructorId,
            thumbnailUrl: event.thumbnailUrl,
            learningObjectives: event.learningObjectives,
            targetAudience: event.targetAudience,
            prerequisites: event.prerequisites,
            language: event.language,
            capacity: event.capacity,
            priceBdt: event.priceBdt,
            registrationOpensAt: event.registrationOpensAt,
            registrationClosesAt: event.registrationClosesAt,
            startAt: event.startAt,
            endAt: event.endAt,
            featured: event.featured,
            termsAndRefundPolicy: event.termsAndRefundPolicy,
          }}
        />
      </div>

      <Separator />

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Sessions</h2>

        <div className="flex flex-col divide-y rounded-lg border">
          {event.sessions.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              No Sessions yet — add the first one below.
            </p>
          )}
          {event.sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between gap-4 p-3 text-sm"
            >
              <div>
                <p className="font-medium">
                  {session.sequence}. {session.title}
                </p>
                <p className="text-muted-foreground">
                  {session.startAt.toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}{" "}
                  · {session.platform}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{session.status}</Badge>
                <Button
                  render={
                    <Link href={`/admin/events/${event.id}/sessions/${session.id}`}>
                      Edit
                    </Link>
                  }
                  size="sm"
                  variant="outline"
                />
                {session.status !== "CANCELLED" && (
                  <form action={cancelEventSession.bind(null, session.id)}>
                    <Button type="submit" size="sm" variant="destructive">
                      Cancel
                    </Button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="mb-3 text-sm font-medium">Add Session</h3>
          <SessionForm
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

      {event.priceBdt > 0 && (
        <>
          <Separator />
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-medium">Coupons</h2>
            <div className="flex flex-wrap gap-2">
              {event.discountEvents.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No coupons attached to this Event.
                </p>
              )}
              {event.discountEvents.map((de) => (
                <Badge key={de.id} variant="secondary">
                  {de.discount.code}
                </Badge>
              ))}
            </div>
            <AttachCouponForm eventId={event.id} />
          </div>
        </>
      )}

      <Separator />

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Announcements</h2>
        <p className="text-sm text-muted-foreground">
          Sends an in-app + email notification to every confirmed and
          waitlisted registrant.
        </p>
        <AnnouncementForm eventId={event.id} />
      </div>
    </div>
  );
}
