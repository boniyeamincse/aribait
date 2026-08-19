import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { getPublishedEventBySlug } from "@/lib/events/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatBdt } from "@/lib/utils";

import { RegisterButton } from "./register-button";

const EVENT_TYPE_LABELS: Record<string, string> = {
  LIVE_CLASS: "Live class",
  TRAINING_PROGRAM: "Training program",
  WORKSHOP: "Workshop",
  SEMINAR: "Seminar",
};

export default async function EventDetailPage({
  params,
}: PageProps<"/events/[slug]">) {
  const { slug } = await params;

  const event = await getPublishedEventBySlug(slug);
  if (!event) notFound();

  const session = await auth();
  const existingRegistration = session?.user
    ? await prisma.registration.findUnique({
        where: { userId_eventId: { userId: session.user.id, eventId: event.id } },
      })
    : null;

  const now = new Date();
  const registrationOpen =
    event.status === "PUBLISHED" &&
    (!event.registrationOpensAt || now >= event.registrationOpensAt) &&
    (!event.registrationClosesAt || now <= event.registrationClosesAt);

  const confirmedCount = event._count.registrations;
  const isFull = event.capacity !== null && confirmedCount >= event.capacity;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center gap-2">
        <Badge variant="outline">
          {EVENT_TYPE_LABELS[event.type] ?? event.type}
        </Badge>
        <Badge variant="secondary">{event.category.name}</Badge>
        {event.status === "CANCELLED" && (
          <Badge variant="destructive">Cancelled</Badge>
        )}
      </div>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        {event.title}
      </h1>
      <p className="mt-2 text-muted-foreground">{event.shortDescription}</p>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
        <span>
          Instructor:{" "}
          <Link
            href={`/instructors/${event.instructor.slug}`}
            className="underline underline-offset-4"
          >
            {event.instructor.name}
          </Link>
        </span>
        <span>
          Starts{" "}
          {event.startAt.toLocaleString("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </span>
        <span>{event.language}</span>
        <span>
          {event.capacity
            ? `${confirmedCount}/${event.capacity} seats filled`
            : "Unlimited seats"}
        </span>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <span className="text-2xl font-semibold">
          {formatBdt(event.priceBdt)}
        </span>

        {!session?.user && (
          <Button
            render={
              <Link href={`/login?callbackUrl=/events/${event.slug}`}>
                Log in to register
              </Link>
            }
          />
        )}

        {session?.user && existingRegistration && (
          <Badge variant="secondary">
            {existingRegistration.status === "CONFIRMED" && "You're registered"}
            {existingRegistration.status === "WAITLISTED" && "You're waitlisted"}
            {existingRegistration.status === "CANCELLED" && "Registration cancelled"}
          </Badge>
        )}

        {session?.user &&
          !existingRegistration &&
          event.status === "CANCELLED" && (
            <p className="text-sm text-destructive">
              This Event has been cancelled.
            </p>
          )}

        {session?.user &&
          !existingRegistration &&
          event.status !== "CANCELLED" &&
          !registrationOpen && (
            <p className="text-sm text-muted-foreground">
              Registration is not currently open.
            </p>
          )}

        {session?.user &&
          !existingRegistration &&
          event.status !== "CANCELLED" &&
          registrationOpen &&
          event.priceBdt === 0 && <RegisterButton eventId={event.id} />}

        {session?.user &&
          !existingRegistration &&
          event.status !== "CANCELLED" &&
          registrationOpen &&
          event.priceBdt > 0 && (
            <p className="text-sm text-muted-foreground">
              Paid registration (bKash/Nagad) lands in Phase 3.
            </p>
          )}

        {isFull && (
          <span className="text-sm text-muted-foreground">
            Full — new registrations join the waitlist
          </span>
        )}
      </div>

      <Separator className="my-8" />

      <div>
        <h2 className="text-lg font-medium">About this Event</h2>
        <p className="mt-2 whitespace-pre-line">{event.description}</p>
      </div>

      {event.learningObjectives && (
        <div className="mt-6">
          <h2 className="text-lg font-medium">What you&apos;ll learn</h2>
          <p className="mt-2 whitespace-pre-line">{event.learningObjectives}</p>
        </div>
      )}

      {event.prerequisites && (
        <div className="mt-6">
          <h2 className="text-lg font-medium">Prerequisites</h2>
          <p className="mt-2 whitespace-pre-line">{event.prerequisites}</p>
        </div>
      )}

      <Separator className="my-8" />

      <div>
        <h2 className="text-lg font-medium">Sessions</h2>
        <div className="mt-4 divide-y rounded-lg border">
          {event.sessions.map((eventSession) => (
            <div key={eventSession.id} className="flex items-center justify-between gap-4 p-4 text-sm">
              <div>
                <p className="font-medium">
                  {eventSession.sequence}. {eventSession.title}
                </p>
                <p className="text-muted-foreground">
                  {eventSession.hostInstructor?.name} · {eventSession.platform}
                </p>
              </div>
              <p className="text-muted-foreground">
                {eventSession.startAt.toLocaleString("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          ))}
        </div>
      </div>

      {event.termsAndRefundPolicy && (
        <div className="mt-8">
          <h2 className="text-lg font-medium">Terms and refund policy</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
            {event.termsAndRefundPolicy}
          </p>
        </div>
      )}
    </div>
  );
}
