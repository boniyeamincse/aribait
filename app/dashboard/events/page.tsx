import Link from "next/link";

import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { formatBdt } from "@/lib/utils";

import { CancelRegistrationButton } from "./cancel-registration-button";
import { StarReviewForm } from "./review-form";

export default async function MyEventsPage() {
  const user = await requireUser();

  const [registrations, reviews] = await Promise.all([
    prisma.registration.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { event: { include: { instructor: { select: { name: true } } } } },
    }),
    prisma.review.findMany({ where: { userId: user.id } }),
  ]);
  const reviewByEventId = new Map(reviews.map((r) => [r.eventId, r]));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">My Events</h1>
      <div className="flex flex-col gap-3">
        {registrations.length === 0 && (
          <p className="rounded-xl border border-slate-200 p-6 text-sm text-muted-foreground text-center">
            You haven&apos;t registered for any Events yet.{" "}
            <Link href="/events" className="font-medium text-indigo-600 underline-offset-4 hover:underline">
              Browse Events →
            </Link>
          </p>
        )}
        {registrations.map((registration) => (
          <div
            key={registration.id}
            className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <Link
                  href={`/events/${registration.event.slug}`}
                  className="font-semibold text-slate-900 underline-offset-4 hover:underline"
                >
                  {registration.event.title}
                </Link>
                <p className="mt-0.5 text-xs text-slate-500">
                  Instructor: {registration.event.instructor.name} ·{" "}
                  {formatBdt(registration.event.priceBdt)} ·{" "}
                  {registration.event.startAt.toLocaleDateString("en-GB", {
                    dateStyle: "medium",
                  })}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="secondary">{registration.status}</Badge>
                {(registration.status === "CONFIRMED" ||
                  registration.status === "WAITLISTED") && (
                  <CancelRegistrationButton registrationId={registration.id} />
                )}
              </div>
            </div>

            {/* Review — available after CONFIRMED or COMPLETED */}
            {(registration.status === "CONFIRMED" ||
              registration.status === "COMPLETED") && (
              <StarReviewForm
                eventId={registration.eventId}
                eventTitle={registration.event.title}
                existing={reviewByEventId.get(registration.eventId) ?? null}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
