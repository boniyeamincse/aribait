import Link from "next/link";
import { ChevronLeft, ChevronRight, AlertTriangle, Filter, CalendarDays, Clock, Video, User } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  dhakaMonthRangeFor,
  getCalendarSessions,
  getInstructorSchedulingConflicts,
} from "@/lib/admin/calendar";
import { prisma } from "@/lib/db/client";
import { Button } from "@/components/ui/button";

const SESSION_STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "bg-slate-100 text-slate-700 border-slate-200",
  JOIN_OPEN: "bg-amber-100 text-amber-700 border-amber-200",
  LIVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  COMPLETED: "bg-slate-200 text-slate-600 border-slate-300",
  RESCHEDULED: "bg-purple-100 text-purple-700 border-purple-200",
};

function monthLabel(year: number, month: number) {
  return new Date(Date.UTC(year, month, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function AdminCalendarPage(props: PageProps<"/admin/calendar">) {
  const searchParams = await props.searchParams;

  const now = new Date();
  const dhakaNow = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  const requestedMonth = typeof searchParams.month === "string" ? searchParams.month : "";
  const [yearStr, monthStr] = requestedMonth.split("-");
  const year = Number(yearStr) || dhakaNow.getUTCFullYear();
  const month = monthStr ? Number(monthStr) - 1 : dhakaNow.getUTCMonth();

  const categoryId = typeof searchParams.category === "string" ? searchParams.category : "";
  const instructorId = typeof searchParams.instructor === "string" ? searchParams.instructor : "";
  const platform = typeof searchParams.platform === "string" ? searchParams.platform : "";

  const { start, end } = dhakaMonthRangeFor(year, month);
  const prevStart = dhakaMonthRangeFor(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1).start;
  const nextStart = dhakaMonthRangeFor(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1).start;
  const toParam = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

  const [days, categories, instructors] = await Promise.all([
    getCalendarSessions({
      start,
      end,
      categoryId: categoryId || undefined,
      instructorId: instructorId || undefined,
      platform: platform || undefined,
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.instructor.findMany({ orderBy: { name: "asc" } }),
  ]);

  const allSessions = days.flatMap((d) => d.sessions);
  const conflictIds = getInstructorSchedulingConflicts(allSessions);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Master Calendar"
        description="Comprehensive agenda view of all platform sessions, with built-in instructor conflict detection."
      />

      {/* Modern Filter & Navigation Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between xl:justify-start gap-4">
          <Button
            render={<Link href={`/admin/calendar?month=${toParam(prevStart)}`} />}
            nativeButton={false}
            variant="outline"
            size="sm"
            className="gap-1 px-3 shadow-sm"
          >
            <ChevronLeft size={16} /> Prev
          </Button>
          
          <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-bold text-sm tracking-wide">
            <CalendarDays size={16} />
            {monthLabel(year, month).toUpperCase()}
          </div>
          
          <Button
            render={<Link href={`/admin/calendar?month=${toParam(nextStart)}`} />}
            nativeButton={false}
            variant="outline"
            size="sm"
            className="gap-1 px-3 shadow-sm"
          >
            Next <ChevronRight size={16} />
          </Button>
        </div>

        <form className="flex flex-col sm:flex-row gap-3 xl:gap-2">
          <input type="hidden" name="month" value={`${year}-${String(month + 1).padStart(2, "0")}`} />
          
          <select
            name="category"
            defaultValue={categoryId}
            className="w-full sm:w-auto rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          
          <select
            name="instructor"
            defaultValue={instructorId}
            className="w-full sm:w-auto rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
          >
            <option value="">All Instructors</option>
            {instructors.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
          
          <select
            name="platform"
            defaultValue={platform}
            className="w-full sm:w-auto rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
          >
            <option value="">All Platforms</option>
            <option value="ZOOM">Zoom</option>
            <option value="GOOGLE_MEET">Google Meet</option>
            <option value="MICROSOFT_TEAMS">Microsoft Teams</option>
            <option value="CUSTOM">Custom</option>
          </select>
          
          <Button
            type="submit"
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm gap-1.5"
          >
            <Filter size={16} /> Filter
          </Button>
        </form>
      </div>

      {/* Conflict Warning */}
      {conflictIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 font-medium shadow-sm">
          <AlertTriangle size={20} className="text-red-500 shrink-0" />
          <span>
            <strong className="font-bold">{conflictIds.size} session{conflictIds.size === 1 ? "" : "s"}</strong> have an instructor scheduling conflict this month. Please review the flagged items below.
          </span>
        </div>
      )}

      {/* Agenda View */}
      <div className="flex flex-col gap-6">
        {days.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-16 text-center shadow-sm">
            <CalendarDays size={32} className="text-slate-400" />
            <p className="text-sm font-medium text-slate-600">
              No sessions scheduled for {monthLabel(year, month)}.
            </p>
          </div>
        )}
        
        {days.map(({ date, sessions }) => (
          <div key={date} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
              <h3 className="text-[13px] font-bold uppercase tracking-widest text-indigo-600">
                {new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </h3>
            </div>
            
            <div className="divide-y divide-slate-100">
              {sessions.map((s) => (
                <Link
                  key={s.id}
                  href={`/admin/events/${s.event.id}?tab=sessions`}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    {/* Time Box */}
                    <div className="flex flex-col items-center justify-center w-16 shrink-0 rounded-lg bg-indigo-50 py-2 border border-indigo-100">
                      <span className="text-[10px] uppercase font-bold text-indigo-400 mb-0.5">Time</span>
                      <span className="text-sm font-bold text-indigo-700">
                        {s.startAt.toLocaleTimeString("en-US", {
                          timeZone: "Asia/Dhaka",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: false
                        })}
                      </span>
                    </div>
                    
                    {/* Session Details */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <p className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {s.title}
                        </p>
                        {conflictIds.has(s.id) && (
                          <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600 border border-red-200">
                            <AlertTriangle size={10} />
                            CONFLICT
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-medium text-slate-500">
                        <span className="text-slate-700">{s.event.title}</span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1">
                          <User size={12} className="text-slate-400" />
                          {s.hostInstructor?.name ?? "Unassigned"}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1">
                          <Video size={12} className="text-slate-400" />
                          {s.platform.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status */}
                  <div className="shrink-0 self-start sm:self-auto pl-20 sm:pl-0">
                    <StatusBadge status={s.status} map={SESSION_STATUS_COLORS} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
