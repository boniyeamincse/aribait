import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { formatBdt } from "@/lib/utils";

export default async function BookingSuccessPage({
  searchParams,
}: PageProps<"/booking/success">) {
  const user = await requireUser();
  const params = await searchParams;
  const registrationId = typeof params.registration === "string" ? params.registration : "";

  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { event: { include: { _count: { select: { sessions: true } } } }, payment: true },
  });
  if (!registration || registration.userId !== user.id) notFound();

  const isFree = registration.priceSnapshotBdt === 0;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {registration.status === "WAITLISTED" ? "You're on the waitlist" : "Enrollment Confirmed!"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {registration.status === "WAITLISTED" ? (
            <>You&apos;ve been added to the waitlist for {registration.event.title}. We&apos;ll confirm your seat if one opens up.</>
          ) : (
            <>
              You have successfully registered for <strong>{registration.event.title}</strong>.
              {registration.event._count.sessions > 0 && (
                <>
                  {" "}
                  Your {registration.event._count.sessions} live Session
                  {registration.event._count.sessions === 1 ? "" : "s"} {registration.event._count.sessions === 1 ? "is" : "are"} now
                  available in your Student Dashboard. You&apos;ll receive a reminder 20 minutes before each Session begins.
                </>
              )}
            </>
          )}
        </p>
      </div>

      <div className="rounded-lg border p-4 text-sm">
        <h2 className="mb-3 font-medium">Booking Summary</h2>
        <dl className="flex flex-col gap-1.5">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Registration ID</dt>
            <dd>{registration.id}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Event</dt>
            <dd>{registration.event.title}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Sessions</dt>
            <dd>{registration.event._count.sessions}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Registration status</dt>
            <dd>{registration.status === "WAITLISTED" ? "Waitlisted" : "Confirmed"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Payment status</dt>
            <dd>{isFree ? "Not Required" : (registration.payment?.status ?? "—")}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Amount</dt>
            <dd>{formatBdt(registration.priceSnapshotBdt - registration.discountAmountSnapshotBdt)}</dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button render={<Link href="/dashboard">View Student Dashboard</Link>} />
        <Button
          variant="outline"
          render={<Link href={`/dashboard/events/${registration.eventId}`}>View My Event</Link>}
        />
        {isFree && registration.status !== "WAITLISTED" && (
          <Button
            variant="outline"
            render={
              <a href={`/dashboard/registrations/${registration.id}/confirmation`}>
                Download Enrollment Confirmation
              </a>
            }
          />
        )}
      </div>
    </div>
  );
}
