import Link from "next/link";
import {
  GraduationCap,
  CalendarDays,
  MonitorPlay,
  Clock,
  Bell,
  AlertCircle,
  CheckCircle,
  LucideIcon,
} from "lucide-react";

import { requireInstructor } from "@/lib/permissions";
import { isEligibleToCreateEvents, INELIGIBLE_MESSAGE } from "@/lib/instructors/eligibility";
import { prisma } from "@/lib/db/client";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";

const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000;

export default async function InstructorDashboardPage() {
  const { user, instructor } = await requireInstructor();
  const eligible = isEligibleToCreateEvents(user, instructor);

  const now = new Date();
  const dhakaNow = new Date(now.getTime() + DHAKA_OFFSET_MS);
  const todayStart = new Date(
    Date.UTC(dhakaNow.getUTCFullYear(), dhakaNow.getUTCMonth(), dhakaNow.getUTCDate()) - DHAKA_OFFSET_MS,
  );
  const todayEnd = new Date(
    Date.UTC(dhakaNow.getUTCFullYear(), dhakaNow.getUTCMonth(), dhakaNow.getUTCDate() + 1) - DHAKA_OFFSET_MS,
  );
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    statusCounts,
    upcomingSessions,
    totalStudents,
    totalEvents,
    todaysSessionsCount,
    upcoming7dCount,
    unreadNotifications,
    sessionsMissingLink,
  ] = await Promise.all([
    prisma.event.groupBy({
      by: ["status"],
      where: { instructorId: instructor.id },
      _count: true,
    }),
    prisma.eventSession.findMany({
      where: {
        hostInstructorId: instructor.id,
        status: { not: "CANCELLED" },
        startAt: { gte: now },
      },
      orderBy: { startAt: "asc" },
      take: 5,
      include: { event: { select: { title: true } } },
    }),
    prisma.registration
      .findMany({
        where: { event: { instructorId: instructor.id } },
        distinct: ["userId"],
        select: { userId: true },
      })
      .then((rows) => rows.length),
    prisma.event.count({ where: { instructorId: instructor.id } }),
    prisma.eventSession.count({
      where: {
        hostInstructorId: instructor.id,
        status: { not: "CANCELLED" },
        startAt: { gte: todayStart, lt: todayEnd },
      },
    }),
    prisma.eventSession.count({
      where: {
        hostInstructorId: instructor.id,
        status: { not: "CANCELLED" },
        startAt: { gte: now, lte: sevenDaysFromNow },
      },
    }),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
    prisma.eventSession.findMany({
      where: {
        hostInstructorId: instructor.id,
        startAt: { gte: now, lte: sevenDaysFromNow },
        status: { in: ["SCHEDULED", "JOIN_OPEN"] },
        meetingUrl: null,
      },
      orderBy: { startAt: "asc" },
      select: { id: true, title: true, startAt: true, event: { select: { id: true } } },
    }),
  ]);

  const countFor = (status: string) =>
    statusCounts.find((c) => c.status === status)?._count ?? 0;

  const kpiCards: { label: string; value: string | number; href: string; icon: LucideIcon; color: string }[] = [
    { label: "Total Students", value: totalStudents, href: "/instructor/students", icon: GraduationCap, color: "blue" },
    { label: "My Events", value: totalEvents, href: "/instructor/events", icon: CalendarDays, color: "indigo" },
    { label: "Today's Sessions", value: todaysSessionsCount, href: "/instructor/sessions", icon: MonitorPlay, color: "emerald" },
    { label: "Upcoming (7 days)", value: upcoming7dCount, href: "/instructor/calendar", icon: Clock, color: "amber" },
    { label: "Unread Notifications", value: unreadNotifications, href: "/instructor/notifications", icon: Bell, color: "rose" },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      <AdminPageHeader
        title={`Welcome, ${user.name ?? "Instructor"}`}
        description="Your Events, Sessions, and students overview."
        actions={
          eligible ? (
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-medium" render={<Link href="/instructor/events/new">Create Event</Link>} nativeButton={false} />
          ) : undefined
        }
      />

      {!eligible && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800 flex items-start gap-3 shadow-sm">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>{INELIGIBLE_MESSAGE}</div>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              href={card.href}
              key={card.label}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
            >
              <div className={`absolute left-0 top-0 h-1 w-full bg-${card.color}-500 opacity-80 group-hover:opacity-100 transition-opacity`} />
              <div className="mb-3 flex items-center justify-between">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-${card.color}-50 text-${card.color}-600 border border-${card.color}-100`}>
                  <Icon size={18} />
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{card.value}</p>
                <span className="mt-1 block text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-indigo-600 transition-colors">
                  {card.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Action required */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-slate-900 px-1">Action Required</h2>
            {sessionsMissingLink.length === 0 ? (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle size={20} />
                </div>
                <span className="font-medium">All upcoming sessions have meeting links. You're all set!</span>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {sessionsMissingLink.map((s) => (
                  <Link
                    key={s.id}
                    href={`/instructor/events/${s.event.id}?tab=sessions`}
                    className="group flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm transition-colors hover:bg-amber-100/50 hover:border-amber-300"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 mt-0.5">
                      <AlertCircle size={20} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-amber-900 group-hover:text-amber-700">Needs Meeting Link</span>
                      <span className="text-xs font-medium text-amber-700 line-clamp-1">
                        {s.title}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600/70 mt-1">
                        {s.startAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Upcoming Sessions */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-bold text-slate-900">Upcoming Sessions</h2>
              <Link href="/instructor/calendar" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                View Calendar &rarr;
              </Link>
            </div>
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              {upcomingSessions.length === 0 && (
                <p className="p-8 text-center text-sm font-medium text-slate-500 bg-slate-50/50">No upcoming sessions scheduled.</p>
              )}
              {upcomingSessions.map((s, idx) => (
                <div key={s.id} className={`flex items-center justify-between gap-4 p-5 transition-colors hover:bg-slate-50 ${idx !== upcomingSessions.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center h-12 w-12 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700">
                      <span className="text-[10px] font-bold uppercase tracking-widest">{s.startAt.toLocaleString("en-GB", { month: "short" })}</span>
                      <span className="text-lg font-black leading-none">{s.startAt.toLocaleString("en-GB", { day: "numeric" })}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="font-bold text-slate-900 leading-tight">
                        {s.title}
                      </p>
                      <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                        <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">{s.event.title}</span>
                        <span>·</span>
                        <Clock size={12} className="text-slate-400" />
                        {s.startAt.toLocaleString("en-GB", { timeStyle: "short" })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Event Status Overview */}
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-slate-900 px-1">Event Status Overview</h2>
          <div className="flex flex-col gap-3">
            {[
              { label: "Drafts", status: "DRAFT", color: "slate", description: "Not yet submitted" },
              { label: "Pending Approval", status: "PENDING_APPROVAL", color: "amber", description: "Awaiting admin review" },
              { label: "Needs Changes", status: "CHANGES_REQUESTED", color: "rose", description: "Requires your updates" },
              { label: "Published", status: "PUBLISHED", color: "emerald", description: "Live and active" },
            ].map((card) => {
              const count = countFor(card.status);
              return (
                <div key={card.status} className={`flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-${card.color}-200 transition-colors group relative overflow-hidden`}>
                  <div className={`absolute left-0 top-0 h-full w-1 bg-${card.color}-400 opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-slate-900">
                      {card.label}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {card.description}
                    </span>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-${card.color}-50 text-${card.color}-700 font-black text-lg`}>
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
