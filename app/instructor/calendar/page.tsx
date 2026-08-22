import Link from "next/link";

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
  SCHEDULED: "bg-slate-500/15 text-slate-500 border-slate-500/30",
  JOIN_OPEN: "bg-cyan-500/15 text-cyan-600 border-cyan-500/30",
  LIVE: "bg-red-500/15 text-red-600 border-red-500/30",
  COMPLETED: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  RESCHEDULED: "bg-amber-500/15 text-amber-600 border-amber-500/30",
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
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Calendar"
        description="Days with a Session you're hosting are marked — scroll down for the full agenda."
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/instructor/calendar?month=${toParam(prevStart)}`}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            ← Prev
          </Link>
          <span className="text-sm font-semibold text-slate-900">{monthLabel(year, month)}</span>
          <Link
            href={`/instructor/calendar?month=${toParam(nextStart)}`}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            Next →
          </Link>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" /> Has session
        </div>
      </div>

      {conflictIds.size > 0 && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {conflictIds.size} of your session{conflictIds.size === 1 ? "" : "s"} overlap in time this
          month — flagged below.
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-1">
              {w}
            </div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}
          {cells.map(({ day, dateKey }) => {
            const sessions = byDate.get(dateKey) ?? [];
            const hasSessions = sessions.length > 0;
            const isToday = dateKey === todayKey;
            return (
              <div
                key={dateKey}
                className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg border text-sm ${
                  hasSessions
                    ? "border-red-300 bg-red-50 text-red-700 font-semibold"
                    : "border-slate-100 bg-slate-50/50 text-slate-500"
                } ${isToday ? "ring-2 ring-indigo-400" : ""}`}
              >
                <span>{day}</span>
                {hasSessions && (
                  <span className="text-[10px] font-normal">
                    {sessions.length} session{sessions.length === 1 ? "" : "s"}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-slate-900">Agenda</h2>
        {days.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No Sessions scheduled in {monthLabel(year, month)}.
          </div>
        )}
        {days.map(({ date, sessions }) => (
          <div key={date} className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              {new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </h3>
            <div className="divide-y divide-slate-100">
              {sessions.map((s) => (
                <Link
                  key={s.id}
                  href={`/instructor/events/${s.event.id}?tab=sessions`}
                  className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-sm hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-16 shrink-0 text-slate-500">
                      {s.startAt.toLocaleTimeString("en-US", {
                        timeZone: "Asia/Dhaka",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                    <div>
                      <p className="font-medium text-slate-900">
                        {s.title}
                        {conflictIds.has(s.id) && (
                          <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                            Overlap
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">{s.event.title}</p>
                    </div>
                  </div>
                  <StatusBadge status={s.status} map={SESSION_STATUS_COLORS} />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
