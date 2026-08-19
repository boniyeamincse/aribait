import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBdt } from "@/lib/utils";

export default async function MyEventDetailPage({
  params,
}: PageProps<"/dashboard/events/[eventId]">) {
  const { eventId } = await params;
  const user = await requireUser();

  const registration = await prisma.registration.findUnique({
    where: { userId_eventId: { userId: user.id, eventId } },
    include: {
      event: { include: { sessions: { orderBy: { sequence: "asc" } } } },
      payment: true,
      certificate: true,
      attendances: { where: { status: { in: ["PRESENT", "LATE"] } } },
    },
  });
  if (!registration) notFound();

  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  const beforeMinutes = settings?.joinWindowBeforeMinutes ?? 20;
  const afterMinutes = settings?.joinWindowAfterMinutes ?? 15;
  const now = new Date();

  const { event } = registration;
  const totalSessions = event.sessions.length;
  const attendedCount = registration.attendances.length;
  const required = event.minAttendanceSessions;
  const certificateEligible =
    registration.status === "COMPLETED" && (required === null || attendedCount >= required);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <Link href="/dashboard/events" className="text-sm text-muted-foreground underline underline-offset-4">
          My Events
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{event.title}</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-lg border p-4 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Registration</p>
          <Badge variant="secondary" className="mt-1">{registration.status}</Badge>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Payment</p>
          <p className="mt-1 font-medium">
            {registration.payment ? registration.payment.status : "Not Required"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Attendance</p>
          <p className="mt-1 font-medium">
            {attendedCount} of {totalSessions} Session{totalSessions === 1 ? "" : "s"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Certificate</p>
          <p className="mt-1 font-medium">
            {registration.certificate
              ? registration.certificate.status === "ISSUED"
                ? "Issued"
                : "Revoked"
              : certificateEligible
                ? "Eligible"
                : "Not Yet Eligible"}
          </p>
        </div>
      </div>

      {registration.certificate?.status === "ISSUED" && (
        <a
          href={`/dashboard/certificates/${registration.certificate.id}/download`}
          className="self-start text-sm text-cyan-600 underline underline-offset-4"
        >
          Download certificate
        </a>
      )}

      {registration.payment?.status === "PAID" && (
        <a
          href={`/dashboard/payments/${registration.payment.id}/invoice`}
          className="self-start text-sm text-cyan-600 underline underline-offset-4"
        >
          Download invoice
        </a>
      )}
      {!registration.payment &&
        (registration.status === "CONFIRMED" || registration.status === "COMPLETED") && (
          <a
            href={`/dashboard/registrations/${registration.id}/confirmation`}
            className="self-start text-sm text-cyan-600 underline underline-offset-4"
          >
            Download enrollment confirmation
          </a>
        )}

      <div>
        <h2 className="text-lg font-medium">Sessions</h2>
        <div className="mt-3 divide-y rounded-lg border">
          {event.sessions.map((session) => {
            const opensAt = new Date(session.startAt.getTime() - beforeMinutes * 60_000);
            const closesAt = new Date(session.endAt.getTime() + afterMinutes * 60_000);
            const canJoin =
              registration.status === "CONFIRMED" &&
              !!session.meetingUrl &&
              now >= opensAt &&
              now <= closesAt;

            return (
              <div key={session.id} className="flex items-center justify-between gap-4 p-4 text-sm">
                <div>
                  <p className="font-medium">
                    {session.sequence}. {session.title}
                  </p>
                  <p className="text-muted-foreground">
                    {session.startAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })} ·{" "}
                    {session.platform.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{session.status}</Badge>
                  {canJoin ? (
                    <Button
                      size="sm"
                      render={<Link href={`/dashboard/sessions/${session.id}/join`}>Join Live Class</Link>}
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {now < opensAt
                        ? `Join opens ${beforeMinutes} min before start`
                        : "Join not open"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{formatBdt(event.priceBdt)}</p>
    </div>
  );
}
