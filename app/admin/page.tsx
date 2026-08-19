import Link from "next/link";

import { StatusBadge } from "@/components/admin/status-badge";
import {
  getActionRequired,
  getKpis,
  getRecentActivity,
  getRegistrationTrend,
  getRevenueTrend,
  getTodaysSessions,
  getUpcomingSessions,
} from "@/lib/admin/overview";
import { requireAdmin } from "@/lib/permissions";
import { formatBdtAmount } from "@/lib/utils";

const SESSION_STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  JOIN_OPEN: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  LIVE: "bg-red-500/15 text-red-400 border-red-500/30",
  COMPLETED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  CANCELLED: "bg-red-500/15 text-red-400 border-red-500/30",
  RESCHEDULED: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

const URGENCY_BORDER: Record<string, string> = {
  high: "border-l-red-500",
  medium: "border-l-amber-500",
  low: "border-l-cyan-500",
};

function timeInDhaka(date: Date) {
  return date.toLocaleTimeString("en-US", {
    timeZone: "Asia/Dhaka",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminOverviewPage() {
  const user = await requireAdmin();

  const [kpis, actionItems, todaysSessions, upcomingSessions, registrationTrend, revenueTrend, recentActivity] =
    await Promise.all([
      getKpis(),
      getActionRequired(),
      getTodaysSessions(),
      getUpcomingSessions(),
      getRegistrationTrend(),
      getRevenueTrend(),
      getRecentActivity(),
    ]);

  const dhakaHour = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Dhaka", hour: "numeric", hourCycle: "h23" }).format(
      new Date(),
    ),
  );
  const greeting = dhakaHour < 12 ? "Good morning" : dhakaHour < 17 ? "Good afternoon" : "Good evening";
  const todayLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dhaka",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const kpiCards = [
    { label: "Total Students", value: kpis.totalStudents, href: "/admin/students" },
    { label: "Active Events", value: kpis.activeEvents, href: "/admin/events" },
    { label: "Today's Sessions", value: kpis.todaysSessionsCount, href: "/admin/sessions" },
    { label: "Upcoming Sessions", value: kpis.upcomingSessionsCount, href: "/admin/sessions" },
    { label: "Confirmed Registrations", value: kpis.confirmedRegistrations, href: "/admin/registrations" },
    { label: "Seats Available", value: kpis.availableSeats, href: "/admin/events" },
    { label: "Monthly Revenue", value: formatBdtAmount(kpis.monthlyRevenueBdt), href: "/admin/reports" },
    {
      label: "Payment Success Rate",
      value: kpis.paymentSuccessRatePct === null ? "—" : `${kpis.paymentSuccessRatePct}%`,
      href: "/admin/payments",
    },
  ];

  const maxRegistrationCount = Math.max(1, ...registrationTrend.map((d) => d.count));
  const maxRevenue = Math.max(1, ...revenueTrend.map((d) => d.revenueBdt));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-white">
          {greeting}, {user.name ?? "Admin"}
        </h1>
        <p className="text-sm text-slate-400">{todayLabel} · Asia/Dhaka</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-white sm:text-3xl">{card.value}</p>
            <Link href={card.href} className="mt-3 inline-block text-xs text-cyan-400 hover:underline">
              View details →
            </Link>
          </div>
        ))}
      </div>

      {/* Action required */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-white">Action Required</h2>
        {actionItems.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-500">
            Nothing needs attention right now.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {actionItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl border border-slate-800 border-l-4 bg-slate-900 px-4 py-3 text-sm text-slate-300 transition-colors hover:bg-slate-800/60 ${URGENCY_BORDER[item.urgency]}`}
              >
                <span className="flex-1">{item.label}</span>
                <span className="text-cyan-400">→</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Today's sessions */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-white">Today&apos;s Sessions</h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-800 text-xs uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-left">Session</th>
                <th className="px-4 py-3 text-left">Event</th>
                <th className="px-4 py-3 text-left">Platform</th>
                <th className="px-4 py-3 text-right">Students</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {todaysSessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-600">
                    No sessions scheduled for today.
                  </td>
                </tr>
              ) : (
                todaysSessions.map((s) => (
                  <tr key={s.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="px-4 py-3 text-slate-300">{timeInDhaka(s.startAt)}</td>
                    <td className="px-4 py-3 text-white">
                      <Link href={`/admin/events/${s.eventId}`} className="hover:underline">
                        {s.title}
                      </Link>
                      {!s.hasMeetingLink && (
                        <span className="ml-2 text-xs text-amber-400">missing link</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{s.eventTitle}</td>
                    <td className="px-4 py-3 text-slate-400">{s.platform.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3 text-right text-slate-300">{s.confirmedStudents}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={s.status} map={SESSION_STATUS_COLORS} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Upcoming 7-day timeline */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-white">Upcoming Sessions (next 7 days)</h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-800 text-xs uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Date/Time</th>
                <th className="px-4 py-3 text-left">Session</th>
                <th className="px-4 py-3 text-left">Instructor</th>
                <th className="px-4 py-3 text-right">Students</th>
                <th className="px-4 py-3 text-left">Meeting</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {upcomingSessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-600">
                    Nothing scheduled in the next 7 days.
                  </td>
                </tr>
              ) : (
                upcomingSessions.map((s) => (
                  <tr key={s.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="px-4 py-3 text-slate-300">
                      {s.startAt.toLocaleString("en-US", {
                        timeZone: "Asia/Dhaka",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-white">
                      {s.title}
                      <span className="block text-xs text-slate-500">{s.eventTitle}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{s.instructorName}</td>
                    <td className="px-4 py-3 text-right text-slate-300">{s.confirmedStudents}</td>
                    <td className="px-4 py-3">
                      {s.hasMeetingLink ? (
                        <span className="text-emerald-400">configured</span>
                      ) : (
                        <span className="text-amber-400">missing</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={s.status} map={SESSION_STATUS_COLORS} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-300">Registration Trend (30 days)</h2>
          <div className="flex h-32 items-end gap-[3px]">
            {registrationTrend.map((d) => (
              <div
                key={d.date}
                title={`${d.date}: ${d.count}`}
                className="flex-1 rounded-t bg-gradient-to-t from-cyan-500 to-violet-500"
                style={{ height: `${Math.max(4, (d.count / maxRegistrationCount) * 100)}%` }}
              />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-300">Revenue Trend</h2>
          <div className="flex items-end gap-4">
            {revenueTrend.map((d) => (
              <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
                <div
                  title={formatBdtAmount(d.revenueBdt)}
                  className="w-full rounded-t bg-gradient-to-t from-cyan-500 to-violet-500"
                  style={{ height: `${Math.max(4, (d.revenueBdt / maxRevenue) * 96)}px` }}
                />
                <span className="text-xs text-slate-500">{d.label}</span>
                <span className="text-xs font-semibold text-slate-300">{formatBdtAmount(d.revenueBdt)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Recent activity */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 divide-y divide-slate-800/50">
          {recentActivity.length === 0 ? (
            <p className="p-5 text-sm text-slate-600">No recent activity.</p>
          ) : (
            recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 text-sm">
                <span className="flex-1 text-slate-300">{item.text}</span>
                <span className="whitespace-nowrap text-xs text-slate-600">
                  {item.at.toLocaleString("en-US", { timeZone: "Asia/Dhaka", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
