import { notFound } from "next/navigation";

import { prisma } from "@/lib/db/client";

import { AttendanceMarkRow } from "./attendance-mark-row";

export default async function AdminSessionAttendancePage({
  params,
}: PageProps<"/admin/attendance/[sessionId]">) {
  const { sessionId } = await params;

  const session = await prisma.eventSession.findUnique({
    where: { id: sessionId },
    include: { event: true },
  });
  if (!session) notFound();

  const registrations = await prisma.registration.findMany({
    where: { eventId: session.eventId, status: "CONFIRMED" },
    orderBy: { createdAt: "asc" },
    include: {
      user: true,
      attendances: { where: { eventSessionId: sessionId } },
    },
  });

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {session.event.title} — {session.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {session.startAt.toLocaleString("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>

      <div className="divide-y rounded-lg border">
        {registrations.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">
            No confirmed registrations for this Event.
          </p>
        )}
        {registrations.map((registration) => {
          const attendance = registration.attendances[0];
          return (
            <div
              key={registration.id}
              className="flex items-center justify-between gap-4 p-4 text-sm"
            >
              <div>
                <p className="font-medium">{registration.user.name}</p>
                <p className="text-muted-foreground">
                  {registration.user.email}
                  {attendance?.joinedAt &&
                    ` · joined ${attendance.joinedAt.toLocaleTimeString("en-GB", { timeStyle: "short" })}`}
                </p>
              </div>
              <AttendanceMarkRow
                registrationId={registration.id}
                eventSessionId={sessionId}
                currentStatus={attendance?.status ?? null}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
