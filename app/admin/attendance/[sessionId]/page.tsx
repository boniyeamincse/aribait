import { notFound } from "next/navigation";

import { prisma } from "@/lib/db/client";

import { AttendanceMarkRow } from "./attendance-mark-row";
import { MarkAllPresentButton } from "./mark-all-present-button";

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {session.event.title} — {session.title}
          </h1>
          <p className="text-sm text-slate-400">
            {session.startAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        {registrations.length > 0 && <MarkAllPresentButton eventSessionId={sessionId} />}
      </div>

      <div className="divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-slate-900">
        {registrations.length === 0 && (
          <p className="p-4 text-sm text-slate-500">No confirmed registrations for this Event.</p>
        )}
        {registrations.map((registration) => {
          const attendance = registration.attendances[0];
          return (
            <div key={registration.id} className="flex flex-wrap items-center justify-between gap-4 p-4 text-sm">
              <div>
                <p className="font-medium text-white">{registration.user.name}</p>
                <p className="text-slate-500">
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
