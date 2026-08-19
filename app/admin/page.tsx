import Link from "next/link";
import {
  GraduationCap,
  CalendarDays,
  MonitorPlay,
  Clock,
  ClipboardList,
  Users,
  CreditCard,
  CheckCircle,
  AlertCircle,
  LucideIcon,
} from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { AdminTable } from "@/components/admin/admin-table";
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

function dateTimeInDhaka(date: Date) {
  return date.toLocaleString("en-US", {
    timeZone: "Asia/Dhaka",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminOverviewPage() {
  const user = await requireAdmin();

  const [
    kpis,
    actionItems,
    todaysSessions,
    upcomingSessions,
    registrationTrend,
    revenueTrend,
    recentActivity,
  ] = await Promise.all([
    getKpis(),
    getActionRequired(),
    getTodaysSessions(),
    getUpcomingSessions(),
    getRegistrationTrend(),
    getRevenueTrend(),
    getRecentActivity(),
  ]);

  const dhakaHour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Dhaka",
      hour: "numeric",
      hourCycle: "h23",
    }).format(new Date()),
  );
  const greeting =
    dhakaHour < 12 ? "Good morning" : dhakaHour < 17 ? "Good afternoon" : "Good evening";
  const todayLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dhaka",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const kpiCards: { label: string; value: string | number; href: string; icon: LucideIcon }[] = [
    { label: "Total Students", value: kpis.totalStudents, href: "/admin/students", icon: GraduationCap },
    { label: "Active Events", value: kpis.activeEvents, href: "/admin/events", icon: CalendarDays },
    { label: "Today's Sessions", value: kpis.todaysSessionsCount, href: "/admin/sessions", icon: MonitorPlay },
    { label: "Upcoming Sessions", value: kpis.upcomingSessionsCount, href: "/admin/sessions", icon: Clock },
    { label: "Confirmed Registrations", value: kpis.confirmedRegistrations, href: "/admin/registrations", icon: ClipboardList },
    { label: "Seats Available", value: kpis.availableSeats, href: "/admin/events", icon: Users },
    { label: "Monthly Revenue", value: formatBdtAmount(kpis.monthlyRevenueBdt), href: "/admin/reports", icon: CreditCard },
    {
      label: "Payment Success Rate",
      value: kpis.paymentSuccessRatePct === null ? "—" : `${kpis.paymentSuccessRatePct}%`,
      href: "/admin/payments",
      icon: CheckCircle,
    },
  ];

  const maxRegistrationCount = Math.max(1, ...registrationTrend.map((d) => d.count));
  const maxRevenue = Math.max(1, ...revenueTrend.map((d) => d.revenueBdt));

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title={`${greeting}, ${user.name ?? "Admin"}`}
        description={`${todayLabel} · Asia/Dhaka`}
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  {card.label}
                </span>
                <Icon size={16} className="text-slate-600" />
              </div>
              <div>
                <p className="mt-1 text-2xl font-bold text-white sm:text-3xl">{card.value}</p>
                <Link href={card.href} className="mt-3 flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                  View details <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action required */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-white">Action Required</h2>
        {actionItems.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-500 flex items-center gap-3">
            <CheckCircle size={18} className="text-emerald-500" />
            Nothing needs attention right now.
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {actionItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-start gap-3 rounded-xl border border-slate-800 border-l-4 bg-slate-900 p-4 text-sm text-slate-300 transition-colors hover:bg-slate-800/60 shadow-sm ${URGENCY_BORDER[item.urgency]}`}
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-slate-500" />
                <span className="flex-1">{item.label}</span>
                <span className="text-cyan-400">&rarr;</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Today's sessions */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-white">Today&apos;s Sessions</h2>
        <AdminTable
          emptyMessage="No sessions scheduled for today."
          rowKey={(s) => s.id}
          rows={todaysSessions}
          columns={[
            { key: "time", label: "Time", render: (s) => timeInDhaka(s.startAt) },
            {
              key: "session",
              label: "Session",
              render: (s) => (
                <div className="flex flex-col gap-1">
                  <Link href={`/admin/events/${s.eventId}`} className="text-white hover:underline font-medium">
                    {s.title}
                  </Link>
                  {!s.hasMeetingLink && <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-400">Missing link</span>}
                </div>
              ),
            },
            { key: "event", label: "Event", render: (s) => s.eventTitle },
            { key: "platform", label: "Platform", render: (s) => s.platform.replace(/_/g, " ") },
            { key: "students", label: "Students", render: (s) => s.confirmedStudents },
            {
              key: "status",
              label: "Status",
              render: (s) => <StatusBadge status={s.status} map={SESSION_STATUS_COLORS} />,
            },
          ]}
        />
      </section>

      {/* Upcoming 7-day timeline */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-white">Upcoming Sessions (next 7 days)</h2>
        <AdminTable
          emptyMessage="Nothing scheduled in the next 7 days."
          rowKey={(s) => s.id}
          rows={upcomingSessions}
          columns={[
            { key: "time", label: "Date/Time", render: (s) => dateTimeInDhaka(s.startAt) },
            {
              key: "session",
              label: "Session",
              render: (s) => (
                <div className="flex flex-col gap-0.5">
                  <span className="text-white font-medium">{s.title}</span>
                  <span className="text-xs text-slate-500">{s.eventTitle}</span>
                </div>
              ),
            },
            { key: "instructor", label: "Instructor", render: (s) => s.instructorName },
            { key: "students", label: "Students", render: (s) => s.confirmedStudents },
            {
              key: "meeting",
              label: "Meeting",
              render: (s) =>
                s.hasMeetingLink ? (
                  <span className="text-emerald-400 text-sm">configured</span>
                ) : (
                  <span className="text-amber-400 text-sm">missing</span>
                ),
            },
            {
              key: "status",
              label: "Status",
              render: (s) => <StatusBadge status={s.status} map={SESSION_STATUS_COLORS} />,
            },
          ]}
        />
      </section>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-slate-500">
            Registration Trend (30 days)
          </h2>
          <div className="flex h-32 items-end gap-[3px]">
            {registrationTrend.map((d) => (
              <div
                key={d.date}
                title={`${d.date}: ${d.count}`}
                className="flex-1 rounded-t bg-gradient-to-t from-cyan-500 to-violet-500 hover:opacity-80 transition-opacity"
                style={{ height: `${Math.max(4, (d.count / maxRegistrationCount) * 100)}%` }}
              />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-slate-500">
            Revenue Trend
          </h2>
          <div className="flex items-end gap-4 h-32">
            {revenueTrend.map((d) => (
              <div key={d.label} className="flex flex-1 flex-col justify-end items-center gap-2 h-full">
                <div
                  title={formatBdtAmount(d.revenueBdt)}
                  className="w-full rounded-t bg-gradient-to-t from-cyan-500 to-violet-500 hover:opacity-80 transition-opacity"
                  style={{ height: `${Math.max(4, (d.revenueBdt / maxRevenue) * 100)}%` }}
                />
                <span className="text-xs text-slate-500 font-medium">{d.label}</span>
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
              <div key={i} className="flex items-start gap-4 px-5 py-4 text-sm">
                <span className="flex-1 text-slate-300 leading-relaxed">{item.text}</span>
                <span className="whitespace-nowrap text-xs text-slate-500 font-medium">
                  {dateTimeInDhaka(item.at)}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
