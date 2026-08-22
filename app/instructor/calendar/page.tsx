import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, AlertTriangle, Video } from "lucide-react";

import { requireInstructor } from "@/lib/permissions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  dhakaMonthRangeFor,
  dhakaDateKey,
  getCalendarSessions,
  getInstructorSchedulingConflicts,
} from "@/lib/admin/calendar";

const SESSION_STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "bg-slate-100 text-slate-700 border-slate-200",
  JOIN_OPEN: "bg-cyan-100 text-cyan-700 border-cyan-200",
  LIVE: "bg-rose-100 text-rose-700 border-rose-200",
  COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  RESCHEDULED: "bg-amber-100 text-amber-700 border-amber-200",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function monthLabel(year: number, month: number) {
  return new Date(Date.UTC(year, month, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function InstructorCalendarPage(props: PageProps<"/instructor/calendar">) {
  const { instructor } = await requireInstructor();
  const searchParams = await props.searchParams;

  const now = new Date();
  const dhakaNow = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  const requestedMonth = typeof searchParams.month === "string" ? searchParams.month : "";
  const [yearStr, monthStr] = requestedMonth.split("-");
  const year = Number(yearStr) || dhakaNow.getUTCFullYear();
  const month = monthStr ? Number(monthStr) - 1 : dhakaNow.getUTCMonth();

  const { start, end } = dhakaMonthRangeFor(year, month);
  const prevStart = dhakaMonthRangeFor(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1).start;
  const nextStart = dhakaMonthRangeFor(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1).start;
  const toParam = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  const todayKey = dhakaDateKey(now);

  const days = await getCalendarSessions({ start, end, instructorId: instructor.id });
  const byDate = new Map(days.map((d) => [d.date, d.sessions]));

  const allSessions = days.flatMap((d) => d.sessions);
  const conflictIds = getInstructorSchedulingConflicts(allSessions);

  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const cells: { day: number; dateKey: string }[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ day, dateKey });
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <AdminPageHeader
        title="Schedule & Calendar"
        description="Your vibrant monthly agenda and session planner."
      />

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Column: Calendar Grid */}
        <div className="w-full lg:w-[450px] shrink-0 flex flex-col gap-4">
          
          {/* Calendar Controls */}
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <Link
              href={`/instructor/calendar?month=${toParam(prevStart)}`}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
            >
              <ChevronLeft size={18} />
            </Link>
            <div className="flex items-center gap-2">
              <CalendarIcon size={18} className="text-indigo-500" />
              <span className="text-base font-bold text-slate-900 uppercase tracking-widest">{monthLabel(year, month)}</span>
            </div>
            <Link
              href={`/instructor/calendar?month=${toParam(nextStart)}`}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
            >
              <ChevronRight size={18} />
            </Link>
          </div>

          {/* Calendar Grid */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
              {WEEKDAYS.map((w) => (
                <div key={w}>{w}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstWeekday }).map((_, i) => (
                <div key={`blank-${i}`} className="aspect-square rounded-xl bg-slate-50/50 border border-slate-100/50" />
              ))}
              {cells.map(({ day, dateKey }) => {
                const sessions = byDate.get(dateKey) ?? [];
                const hasSessions = sessions.length > 0;
                const isToday = dateKey === todayKey;

                // Color logic
                let cellClasses = "border-slate-100 bg-slate-50/50 text-slate-500 hover:border-indigo-200";
                
                if (isToday && hasSessions) {
                  cellClasses = "bg-gradient-to-br from-indigo-500 to-purple-600 border-transparent text-white shadow-md shadow-indigo-200";
                } else if (isToday) {
                  cellClasses = "border-indigo-400 bg-indigo-50 text-indigo-700 font-bold ring-2 ring-indigo-200 ring-offset-1";
                } else if (hasSessions) {
                  cellClasses = "border-indigo-200 bg-indigo-100 text-indigo-800 font-bold hover:bg-indigo-200 hover:border-indigo-300 transition-colors";
                }

                return (
                  <div
                    key={dateKey}
                    className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl border text-sm transition-all cursor-default ${cellClasses}`}
                  >
                    <span className={isToday && hasSessions ? "font-black" : ""}>{day}</span>
                    {hasSessions && (
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${isToday ? "text-indigo-100" : "text-indigo-500"}`}>
                        {sessions.length} {sessions.length === 1 ? "Sess" : "Sess"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="mt-5 flex items-center justify-center gap-4 text-xs font-semibold text-slate-500 uppercase tracking-widest border-t border-slate-100 pt-4">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-md bg-indigo-100 border border-indigo-200" /> Session Day
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600" /> Today (Active)
              </div>
            </div>
          </div>

          {/* Conflict Alert */}
          {conflictIds.size > 0 && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800 shadow-sm animate-pulse">
              <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-bold">Scheduling Conflict</span>
                <span className="text-rose-700/80 leading-relaxed">
                  {conflictIds.size} of your session{conflictIds.size === 1 ? "" : "s"} overlap in time this month. They are flagged in your agenda.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Agenda */}
        <div className="flex-1 w-full flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Monthly Agenda</h2>
            <div className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              {allSessions.length} Total Sessions
            </div>
          </div>
          
          {days.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200 border-dashed bg-slate-50/50 p-12 text-center text-slate-500">
              <CalendarIcon size={32} className="text-slate-300" />
              <p className="font-medium">No Sessions scheduled in {monthLabel(year, month)}.</p>
            </div>
          )}
          
          <div className="flex flex-col gap-6">
            {days.map(({ date, sessions }) => {
              const dayDate = new Date(`${date}T00:00:00`);
              const isTodayStr = date === todayKey;
              
              return (
                <div key={date} className="relative flex flex-col gap-3">
                  {/* Date Header */}
                  <div className="sticky top-0 z-10 flex items-center gap-3 bg-slate-50/90 backdrop-blur-sm py-2 px-1">
                    <div className={`flex items-center justify-center h-8 w-8 rounded-lg font-black text-sm ${isTodayStr ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {dayDate.getDate()}
                    </div>
                    <h3 className={`text-sm font-bold uppercase tracking-widest ${isTodayStr ? 'text-indigo-600' : 'text-slate-500'}`}>
                      {dayDate.toLocaleDateString("en-US", { weekday: "long", month: "long" })}
                      {isTodayStr && " (Today)"}
                    </h3>
                  </div>
                  
                  {/* Sessions List */}
                  <div className="flex flex-col gap-3 pl-4 sm:pl-11 border-l-2 border-slate-100 ml-4 sm:ml-5 pb-2">
                    {sessions.map((s) => {
                      const isConflict = conflictIds.has(s.id);
                      return (
                        <Link
                          key={s.id}
                          href={`/instructor/events/${s.event.id}?tab=sessions`}
                          className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${isConflict ? 'border-rose-200' : 'border-slate-200 hover:border-indigo-200'}`}
                        >
                          <div className="flex items-center gap-4">
                            {/* Time Block */}
                            <div className="flex flex-col items-center justify-center h-14 w-16 shrink-0 rounded-xl bg-slate-50 border border-slate-100">
                              <span className="text-xs font-bold text-slate-400"><Clock size={12} className="mb-0.5 inline-block"/></span>
                              <span className="text-sm font-black text-slate-800 tracking-tight">
                                {s.startAt.toLocaleTimeString("en-US", {
                                  timeZone: "Asia/Dhaka",
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: false
                                })}
                              </span>
                            </div>
                            
                            {/* Details */}
                            <div className="flex flex-col gap-1">
                              <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                                {s.title}
                                {isConflict && (
                                  <span className="flex items-center gap-1 rounded-md bg-rose-100 px-1.5 py-0.5 text-[9px] uppercase tracking-widest font-black text-rose-700 border border-rose-200">
                                    <AlertTriangle size={10} /> Overlap
                                  </span>
                                )}
                              </p>
                              <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                <Video size={12} className="text-indigo-400" />
                                {s.event.title}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center shrink-0">
                            <StatusBadge status={s.status} map={SESSION_STATUS_COLORS} />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
