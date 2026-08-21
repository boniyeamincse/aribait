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

  const coverImage = event.bannerUrl ?? event.thumbnailUrl;

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Premium Header Strip */}
      <div className="bg-slate-900 pt-10 pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-indigo-500/20 text-indigo-300 border-none hover:bg-indigo-500/30">
              {EVENT_TYPE_LABELS[event.type] ?? event.type}
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-none hover:bg-emerald-500/30">
              {event.category.name}
            </Badge>
            {event.status === "CANCELLED" && (
              <Badge variant="destructive">Cancelled</Badge>
            )}
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight">
            {event.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300 leading-relaxed">
            {event.shortDescription}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 -mt-20">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column: Main Content */}
          <div className="w-full lg:w-2/3 flex flex-col gap-8">
            {/* Main Image */}
            <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-lg shadow-slate-200/50">
              {coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverImage}
                  alt={event.title}
                  className="aspect-video w-full rounded-xl object-cover"
                />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                  <span className="text-xl font-bold tracking-tight text-white/80">
                    {EVENT_TYPE_LABELS[event.type] ?? event.type}
                  </span>
                </div>
              )}
            </div>

            {/* About Section */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">About this Event</h2>
              <div className="prose prose-slate max-w-none text-slate-600">
                <p className="whitespace-pre-line leading-relaxed">{event.description}</p>
              </div>
            </div>

            {/* What you'll learn */}
            {event.learningObjectives && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">What you&apos;ll learn</h2>
                <div className="prose prose-slate max-w-none text-slate-600">
                  <p className="whitespace-pre-line leading-relaxed">{event.learningObjectives}</p>
                </div>
              </div>
            )}

            {/* Sessions / Curriculum */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Course Curriculum</h2>
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 overflow-hidden">
                {event.sessions.map((eventSession) =>
                  eventSession.description ? (
                    <details key={eventSession.id} className="group p-5 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 marker:content-none">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {eventSession.sequence}. {eventSession.title}
                            <span className="ml-2 text-xs font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">(Click to expand)</span>
                          </p>
                          <p className="text-sm text-slate-500 mt-1">
                            {eventSession.hostInstructor?.name} · <span className="font-medium text-slate-700">{eventSession.platform}</span>
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-semibold text-slate-700">
                            {eventSession.startAt.toLocaleDateString("en-GB", { month: "short", day: "numeric" })}
                          </p>
                          <p className="text-xs text-slate-500">
                            {eventSession.startAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </summary>
                      <div className="mt-4 pt-4 border-t border-slate-200/60">
                        <SessionAgenda description={eventSession.description} />
                      </div>
                    </details>
                  ) : (
                    <div key={eventSession.id} className="flex items-center justify-between gap-4 p-5 bg-white">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {eventSession.sequence}. {eventSession.title}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {eventSession.hostInstructor?.name} · <span className="font-medium text-slate-700">{eventSession.platform}</span>
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-slate-700">
                          {eventSession.startAt.toLocaleDateString("en-GB", { month: "short", day: "numeric" })}
                        </p>
                        <p className="text-xs text-slate-500">
                          {eventSession.startAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Prerequisites */}
            {event.prerequisites && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Prerequisites</h2>
                <div className="prose prose-slate max-w-none text-slate-600">
                  <p className="whitespace-pre-line leading-relaxed">{event.prerequisites}</p>
                </div>
              </div>
            )}
            
            {hasAccess && resources.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-indigo-50/30 p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Course Resources</h2>
                <div className="divide-y divide-slate-200/60 rounded-xl border border-slate-200/60 bg-white">
                  {resources.map((resource) => (
                    <Link
                      key={resource.id}
                      href={`/dashboard/resources/${resource.id}/view`}
                      className="block p-4 text-sm font-medium text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 transition-colors"
                    >
                      {resource.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Booking Widget */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-24 flex flex-col gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
              <div className="mb-6 flex flex-col items-center justify-center border-b border-slate-100 pb-6 text-center">
                <span className="text-4xl font-extrabold text-slate-900">
                  {event.priceBdt === 0 ? "Free" : formatBdt(event.priceBdt)}
                </span>
                {event.compareAtPriceBdt !== null && event.compareAtPriceBdt > event.priceBdt && (
                  <span className="mt-1 text-base text-slate-400 line-through decoration-slate-300">
                    {formatBdt(event.compareAtPriceBdt)}
                  </span>
                )}
              </div>

              <div className="mb-8">
                <BookingActions
                  event={event}
                  isLoggedIn={!!session?.user}
                  existingRegistration={existingRegistration}
                  registrationOpen={registrationOpen}
                  canRegisterAgain={canRegisterAgain}
                  isFull={isFull}
                />
              </div>

              <div className="space-y-5 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500 shrink-0 mt-0.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <div>
                    <p className="font-semibold text-slate-900">Instructor</p>
                    <Link href={`/instructors/${event.instructor.slug}`} className="text-indigo-600 hover:underline">
                      {event.instructor.name}
                    </Link>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500 shrink-0 mt-0.5"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
                  <div>
                    <p className="font-semibold text-slate-900">Starts At</p>
                    <p>{event.startAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
                  </div>
                </div>

                {event.classSchedule && (
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500 shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <div>
                      <p className="font-semibold text-slate-900">Schedule</p>
                      <p>{event.classSchedule}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500 shrink-0 mt-0.5"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>
                  <div>
                    <p className="font-semibold text-slate-900">Language</p>
                    <p>{event.language}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500 shrink-0 mt-0.5"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
                  <div>
                    <p className="font-semibold text-slate-900">Available Seats</p>
                    <p>{event.capacity ? `${Math.max(0, event.capacity - confirmedCount)} of ${event.capacity} seats available` : "Unlimited seats"}</p>
                  </div>
                </div>

                {event.registrationClosesAt && (
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500 shrink-0 mt-0.5"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    <div>
                      <p className="font-semibold text-slate-900">Registration Closes</p>
                      <p className="text-rose-600 font-medium">{event.registrationClosesAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Policy Box */}
            {event.termsAndRefundPolicy && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm">
                <h3 className="font-semibold text-slate-900 mb-2">Terms & Refund Policy</h3>
                <p className="text-slate-500 leading-relaxed whitespace-pre-line">{event.termsAndRefundPolicy}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
