import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  dhakaMonthRangeFor,
  getCalendarSessions,
  getInstructorSchedulingConflicts,
} from "@/lib/admin/calendar";
import { prisma } from "@/lib/db/client";

const SESSION_STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "bg-slate-500/15 text-slate-500 border-slate-500/30",
  JOIN_OPEN: "bg-cyan-500/15 text-cyan-600 border-cyan-500/30",
  LIVE: "bg-red-500/15 text-red-600 border-red-500/30",
  COMPLETED: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  RESCHEDULED: "bg-amber-500/15 text-amber-600 border-amber-500/30",
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
        title="Calendar"
        description="Agenda view of every Session this month, with instructor conflict detection."
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/calendar?month=${toParam(prevStart)}`}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            ← Prev
          </Link>
          <span className="text-sm font-semibold text-slate-900">{monthLabel(year, month)}</span>
          <Link
            href={`/admin/calendar?month=${toParam(nextStart)}`}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            Next →
          </Link>
        </div>

        <form className="flex flex-wrap gap-2">
          <input type="hidden" name="month" value={`${year}-${String(month + 1).padStart(2, "0")}`} />
          <select
            name="category"
            defaultValue={categoryId}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            name="instructor"
            defaultValue={instructorId}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700"
          >
            <option value="">All instructors</option>
            {instructors.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
          <select
            name="platform"
            defaultValue={platform}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700"
          >
            <option value="">All platforms</option>
            <option value="ZOOM">Zoom</option>
            <option value="GOOGLE_MEET">Google Meet</option>
            <option value="MICROSOFT_TEAMS">Microsoft Teams</option>
            <option value="CUSTOM">Custom</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-green-500 to-blue-600 px-4 py-1.5 text-sm font-semibold text-white"
          >
            Filter
          </button>
        </form>
      </div>

      {conflictIds.size > 0 && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {conflictIds.size} session{conflictIds.size === 1 ? "" : "s"} have an instructor scheduling
          conflict this month — flagged below.
        </div>
      )}

      <div className="flex flex-col gap-4">
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
                  href={`/admin/events/${s.event.id}?tab=sessions`}
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
                            Conflict
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        {s.event.title} · {s.hostInstructor?.name ?? "Unassigned"} ·{" "}
                        {s.platform.replace(/_/g, " ")}
                      </p>
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
