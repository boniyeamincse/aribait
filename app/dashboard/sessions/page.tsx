import Link from "next/link";
import { MonitorPlay, Video, User, Info, ArrowRight, PlayCircle, CalendarDays, Clock } from "lucide-react";

import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function MySessionsPage() {
  const user = await requireUser();
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  const beforeMinutes = settings?.joinWindowBeforeMinutes ?? 20;
  const afterMinutes = settings?.joinWindowAfterMinutes ?? 15;

  const sessions = await prisma.eventSession.findMany({
    where: {
      status: { in: ["SCHEDULED", "JOIN_OPEN", "LIVE", "RESCHEDULED"] },
      event: {
        registrations: { some: { userId: user.id, status: "CONFIRMED" } },
      },
    },
    orderBy: { startAt: "asc" },
    select: {
      id: true,
      title: true,
      startAt: true,
      endAt: true,
      status: true,
      platform: true,
      meetingUrl: true, // presence-checked only, never rendered — see below
      event: { select: { title: true, slug: true } },
      hostInstructor: { select: { name: true } },
    },
  });

  const now = new Date();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 shadow-inner">
          <MonitorPlay size={20} />
        </div>
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">
          My Sessions
        </h1>
      </div>
      <div className="flex items-start gap-3 rounded-2xl bg-indigo-50/50 border border-indigo-100 p-4 backdrop-blur-sm">
        <Info size={20} className="text-indigo-500 shrink-0 mt-0.5" />
        <p className="text-sm text-indigo-900 leading-relaxed font-medium">
          Upcoming live Sessions from your confirmed Events. Join opens{" "}
          <span className="font-bold text-indigo-700">{beforeMinutes} minutes</span> before start and stays open until{" "}
          <span className="font-bold text-indigo-700">{afterMinutes} minutes</span> after the scheduled end.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-white/50 backdrop-blur-md py-16 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 mb-5 shadow-inner">
              <MonitorPlay size={28} className="text-emerald-400" />
            </div>
            <p className="text-lg font-bold text-slate-800">No upcoming Sessions</p>
            <p className="text-sm text-slate-500 mt-1 mb-6">You don&apos;t have any live classes scheduled.</p>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 hover:scale-105 transition-all"
            >
              Browse Events <ArrowRight size={16} />
            </Link>
          </div>
        )}
        {sessions.map((session) => {
          const opensAt = new Date(
            session.startAt.getTime() - beforeMinutes * 60_000,
          );
          const closesAt = new Date(
            session.endAt.getTime() + afterMinutes * 60_000,
          );
          const canJoin =
            !!session.meetingUrl && now >= opensAt && now <= closesAt;

          return (
            <div
              key={session.id}
              className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-[1.5rem] border border-white/60 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 hover:bg-white/80"
            >
              <div className="flex gap-4 items-start">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                  <Video size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {session.event.title}
                  </h3>
                  <p className="font-semibold text-slate-700 text-sm mt-0.5">{session.title}</p>
                  
                  <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1.5 bg-white/80 border border-slate-100 px-2.5 py-1.5 rounded-lg text-slate-700 shadow-sm backdrop-blur-sm">
                      <User size={14} className="text-indigo-400" />
                      {session.hostInstructor?.name ?? "Instructor"}
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/80 border border-slate-100 px-2.5 py-1.5 rounded-lg text-slate-700 shadow-sm backdrop-blur-sm">
                      <Video size={14} className="text-rose-400" />
                      {session.platform}
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/80 border border-slate-100 px-2.5 py-1.5 rounded-lg text-slate-700 shadow-sm backdrop-blur-sm">
                      <CalendarDays size={14} className="text-emerald-500" />
                      {session.startAt.toLocaleString("en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:items-end gap-3 self-start sm:self-center mt-2 sm:mt-0 border-t sm:border-t-0 border-slate-200/50 pt-4 sm:pt-0 w-full sm:w-auto">
                <Badge variant="secondary" className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg border-white/60 bg-white shadow-sm backdrop-blur-md self-start sm:self-auto">
                  {session.status}
                </Badge>
                {canJoin ? (
                  <Link
                    href={`/dashboard/sessions/${session.id}/join`}
                    className="group/btn relative inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 hover:shadow-emerald-500/50 w-full sm:w-auto overflow-hidden"
                  >
                    <PlayCircle size={18} className="animate-pulse relative z-10" />
                    <span className="relative z-10">Join Live Class</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 opacity-0 group-hover/btn:opacity-100 transition-opacity z-0" />
                  </Link>
                ) : (
                  <div className="inline-flex items-center justify-center rounded-full bg-slate-100/80 px-6 py-2.5 text-sm font-bold text-slate-400 border border-slate-200 w-full sm:w-auto">
                    <Clock size={16} className="mr-2" />
                    Join not open
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
