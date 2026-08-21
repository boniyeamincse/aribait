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
import { PayButton } from "./pay-button";

const TOPICS_PATTERN = /^Topics:\s*([\s\S]*?)\.\s*Expected outcome:\s*([\s\S]*)$/;

function SessionAgenda({ description }: { description: string }) {
  const match = description.match(TOPICS_PATTERN);
  if (!match) {
    return <p className="mt-3 whitespace-pre-line border-t pt-3 text-muted-foreground">{description}</p>;
  }

  const topics = match[1]
    .split(";")
    .map((topic) => topic.trim())
    .filter(Boolean);
  const outcome = match[2].trim();

  return (
    <div className="mt-3 border-t pt-3 text-muted-foreground">
      <p className="font-medium text-foreground">Topics</p>
      <ol className="mt-2 list-decimal space-y-1 pl-5">
        {topics.map((topic, i) => (
          <li key={i}>{topic}</li>
        ))}
      </ol>
      {outcome && (
        <p className="mt-3">
          <span className="font-medium text-foreground">Expected outcome: </span>
          {outcome}
        </p>
      )}
    </div>
  );
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  LIVE_CLASS: "Live class",
  TRAINING_PROGRAM: "Training program",
  WORKSHOP: "Workshop",
  SEMINAR: "Seminar",
};

type EventForCta = { id: string; slug: string; status: string; priceBdt: number };
type ExistingRegistrationForCta = {
  status: string;
  payment: { id: string } | null;
} | null;

function BookingActions({
  event,
  isLoggedIn,
  existingRegistration,
  registrationOpen,
  canRegisterAgain,
  isFull,
}: {
  event: EventForCta;
  isLoggedIn: boolean;
  existingRegistration: ExistingRegistrationForCta;
  registrationOpen: boolean;
  canRegisterAgain: boolean;
  isFull: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {!isLoggedIn && (
        <Button
          nativeButton={false}
          render={
            <Link href={`/login?callbackUrl=/events/${event.slug}`}>
              Log in to register
            </Link>
          }
        />
      )}

      {isLoggedIn &&
        existingRegistration &&
        (existingRegistration.status === "CONFIRMED" ||
          existingRegistration.status === "WAITLISTED") && (
          <>
            <Badge variant="secondary">
              {existingRegistration.status === "CONFIRMED"
                ? "You're registered"
                : "You're waitlisted"}
            </Badge>
            {existingRegistration.status === "CONFIRMED" && (
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href={`/dashboard/events/${event.id}`}>View Event in Dashboard</Link>}
              />
            )}
          </>
        )}

      {isLoggedIn &&
        existingRegistration?.status === "PENDING_PAYMENT" &&
        existingRegistration.payment && (
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <Link href={`/dashboard/payments/${existingRegistration.payment.id}`}>
                Continue checkout
              </Link>
            }
          />
        )}

      {isLoggedIn && canRegisterAgain && event.status === "CANCELLED" && (
        <p className="text-sm text-destructive">This Event has been cancelled.</p>
      )}

      {isLoggedIn && canRegisterAgain && event.status !== "CANCELLED" && !registrationOpen && (
        <p className="text-sm text-muted-foreground">Registration is not currently open.</p>
      )}

      {isLoggedIn &&
        canRegisterAgain &&
        event.status !== "CANCELLED" &&
        registrationOpen &&
        event.priceBdt === 0 && <RegisterButton eventId={event.id} />}

      {isLoggedIn &&
        canRegisterAgain &&
        event.status !== "CANCELLED" &&
        registrationOpen &&
        event.priceBdt > 0 &&
        !isFull && <PayButton eventId={event.id} />}

      {isFull && event.priceBdt === 0 && (
        <span className="text-sm text-muted-foreground">
          Full — new registrations join the waitlist
        </span>
      )}
      {isFull && event.priceBdt > 0 && canRegisterAgain && (
        <span className="text-sm text-muted-foreground">This Event is full.</span>
      )}
    </div>
  );
}

export default async function EventDetailPage({
  params,
}: PageProps<"/events/[slug]">) {
  const { slug } = await params;

  const event = await getPublishedEventBySlug(slug);
  if (!event) notFound();

  const session = await auth().catch(() => null);
  const existingRegistration = session?.user
    ? await prisma.registration.findUnique({
        where: { userId_eventId: { userId: session.user.id, eventId: event.id } },
        include: { payment: true },
      })
    : null;

  const now = new Date();
  const registrationOpen =
    event.status === "PUBLISHED" &&
    (!event.registrationOpensAt || now >= event.registrationOpensAt) &&
    (!event.registrationClosesAt || now <= event.registrationClosesAt);

  const confirmedCount = event._count.registrations;
  const isFull = event.capacity !== null && confirmedCount >= event.capacity;
  const canRegisterAgain =
    !existingRegistration ||
    existingRegistration.status === "CANCELLED" ||
    existingRegistration.status === "EXPIRED";
  const hasAccess =
    existingRegistration?.status === "CONFIRMED" ||
    existingRegistration?.status === "COMPLETED";

  const resources = hasAccess
    ? await prisma.eventResource.findMany({
        where: { eventId: event.id },
        orderBy: { createdAt: "asc" },
      })
    : [];

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
            ? `${Math.max(0, event.capacity - confirmedCount)} of ${event.capacity} seats available`
            : "Unlimited seats"}
        </span>
        {event.registrationClosesAt && (
          <span>
            Registration closes{" "}
            {event.registrationClosesAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
          </span>
        )}
        {event.classSchedule && (
          <span className="w-full text-slate-800">
            <strong>Schedule:</strong> {event.classSchedule}
          </span>
        )}
        {event.minAttendanceSessions !== null && (
          <span className="w-full text-slate-800">
            <strong>Certificate:</strong> awarded after attending at least {event.minAttendanceSessions} of{" "}
            {event.sessions.length} Session{event.sessions.length === 1 ? "" : "s"}.
          </span>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <span className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold">{formatBdt(event.priceBdt)}</span>
          {event.compareAtPriceBdt !== null && event.compareAtPriceBdt > event.priceBdt && (
            <span className="text-sm text-muted-foreground line-through">
              {formatBdt(event.compareAtPriceBdt)}
            </span>
          )}
        </span>

        <BookingActions
          event={event}
          isLoggedIn={!!session?.user}
          existingRegistration={existingRegistration}
          registrationOpen={registrationOpen}
          canRegisterAgain={canRegisterAgain}
          isFull={isFull}
        />
      </div>

      <Separator className="my-8" />

      <div>
        <h2 className="text-lg font-medium">About this Event</h2>
        <p className="mt-2 whitespace-pre-line">{event.description}</p>
      </div>

      <Separator className="my-8" />

      <div>
        <h2 className="text-lg font-medium">Sessions</h2>
        <div className="mt-4 divide-y rounded-lg border">
          {event.sessions.map((eventSession) =>
            eventSession.description ? (
              <details key={eventSession.id} className="group p-4 text-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 marker:content-none">
                  <div>
                    <p className="font-medium">
                      {eventSession.sequence}. {eventSession.title}
                      <span className="ml-2 text-xs text-muted-foreground group-open:hidden">(see agenda)</span>
                    </p>
                    <p className="text-muted-foreground">
                      {eventSession.hostInstructor?.name} · {eventSession.platform}
                    </p>
                  </div>
                  <p className="shrink-0 text-muted-foreground">
                    {eventSession.startAt.toLocaleString("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </summary>
                <SessionAgenda description={eventSession.description} />
              </details>
            ) : (
              <div key={eventSession.id} className="flex items-center justify-between gap-4 p-4 text-sm">
                <div>
                  <p className="font-medium">
                    {eventSession.sequence}. {eventSession.title}
                  </p>
                  <p className="text-muted-foreground">
                    {eventSession.hostInstructor?.name} · {eventSession.platform}
                  </p>
                </div>
                <p className="shrink-0 text-muted-foreground">
                  {eventSession.startAt.toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            ),
          )}
        </div>
      </div>

      {event.learningObjectives && (
        <>
          <Separator className="my-8" />
          <div>
            <h2 className="text-lg font-medium">What you&apos;ll learn</h2>
            <p className="mt-2 whitespace-pre-line">{event.learningObjectives}</p>
          </div>
        </>
      )}

      {event.prerequisites && (
        <div className="mt-6">
          <h2 className="text-lg font-medium">Prerequisites</h2>
          <p className="mt-2 whitespace-pre-line">{event.prerequisites}</p>
        </div>
      )}

      <Separator className="my-8" />

      <div className="rounded-lg border bg-accent/30 p-6">
        <h2 className="text-lg font-medium">Ready to join?</h2>
        <div className="mt-4">
          <BookingActions
            event={event}
            isLoggedIn={!!session?.user}
            existingRegistration={existingRegistration}
            registrationOpen={registrationOpen}
            canRegisterAgain={canRegisterAgain}
            isFull={isFull}
          />
        </div>
      </div>

      {hasAccess && resources.length > 0 && (
        <>
          <Separator className="my-8" />
          <div>
            <h2 className="text-lg font-medium">Resources</h2>
            <div className="mt-4 divide-y rounded-lg border">
              {resources.map((resource) => (
                <Link
                  key={resource.id}
                  href={`/dashboard/resources/${resource.id}/view`}
                  className="block p-4 text-sm underline-offset-4 hover:bg-accent hover:underline"
                >
                  {resource.title}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

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
