import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, CheckCircle2, Clock, XCircle, HelpCircle } from "lucide-react";

import { prisma } from "@/lib/db/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  const total = registrations.length;
  const presentCount = registrations.filter(r => r.attendances[0]?.status === "PRESENT").length;
  const lateCount = registrations.filter(r => r.attendances[0]?.status === "LATE").length;
  const absentCount = registrations.filter(r => r.attendances[0]?.status === "ABSENT").length;
  const excusedCount = registrations.filter(r => r.attendances[0]?.status === "EXCUSED").length;
  const unmarkedCount = total - (presentCount + lateCount + absentCount + excusedCount);

  return (
    <div className="flex max-w-4xl flex-col gap-6 mx-auto w-full">
      {/* Navigation & Header */}
      <div className="flex flex-col gap-4">
        <Link 
          href={`/admin/events/${session.eventId}?tab=sessions`}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors w-fit"
        >
          <ArrowLeft size={16} />
          Back to Sessions
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-900 drop-shadow-sm">
              Attendance: <span className="text-indigo-600">{session.title}</span>
            </h1>
            <p className="flex items-center gap-2 text-sm text-slate-600 font-medium">
              <span>{session.event.title}</span>
              <span>•</span>
              <span className="text-slate-500">
                {new Date(session.startAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
              </span>
            </p>
          </div>
          {registrations.length > 0 && <MarkAllPresentButton eventSessionId={sessionId} />}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="bg-slate-50 border-slate-200 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-1">
            <Users className="text-slate-400 mb-1" size={20} />
            <p className="text-2xl font-bold text-slate-900">{total}</p>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Total</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-100 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-1">
            <CheckCircle2 className="text-emerald-500 mb-1" size={20} />
            <p className="text-2xl font-bold text-emerald-900">{presentCount}</p>
            <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-600">Present</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-100 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-1">
            <Clock className="text-amber-500 mb-1" size={20} />
            <p className="text-2xl font-bold text-amber-900">{lateCount}</p>
            <p className="text-[10px] uppercase font-bold tracking-widest text-amber-600">Late</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-100 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-1">
            <XCircle className="text-red-500 mb-1" size={20} />
            <p className="text-2xl font-bold text-red-900">{absentCount}</p>
            <p className="text-[10px] uppercase font-bold tracking-widest text-red-600">Absent</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-50 border-slate-200 shadow-sm border-dashed">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-1">
            <HelpCircle className="text-slate-400 mb-1" size={20} />
            <p className="text-2xl font-bold text-slate-700">{unmarkedCount}</p>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Unmarked</p>
          </CardContent>
        </Card>
      </div>

      {/* Student List */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-white pb-4 border-b border-slate-100">
          <CardTitle className="text-lg">Student Roster</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col divide-y divide-slate-100">
            {registrations.length === 0 && (
              <p className="p-8 text-center text-sm text-slate-500 italic">
                No confirmed registrations for this Event yet.
              </p>
            )}
            {registrations.map((registration) => {
              const attendance = registration.attendances[0];
              const hasJoined = attendance?.joinedAt != null;
              
              return (
                <div key={registration.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase">
                      {registration.user.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{registration.user.name}</p>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <span>{registration.user.email}</span>
                        {attendance?.joinedAt && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-emerald-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Joined at {attendance.joinedAt.toLocaleTimeString("en-US", { timeStyle: "short" })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0">
                    <AttendanceMarkRow
                      registrationId={registration.id}
                      eventSessionId={sessionId}
                      currentStatus={attendance?.status ?? null}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
