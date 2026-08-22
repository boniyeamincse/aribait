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

  const kpiCards: { label: string; value: string | number; href: string; icon: LucideIcon }[] = [
    { label: "Total Students", value: totalStudents, href: "/instructor/students", icon: GraduationCap },
    { label: "My Events", value: totalEvents, href: "/instructor/events", icon: CalendarDays },
    { label: "Today's Sessions", value: todaysSessionsCount, href: "/instructor/sessions", icon: MonitorPlay },
    { label: "Upcoming (7 days)", value: upcoming7dCount, href: "/instructor/calendar", icon: Clock },
    { label: "Unread Notifications", value: unreadNotifications, href: "/instructor/notifications", icon: Bell },
  ];

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title={`Welcome, ${user.name ?? "Instructor"}`}
        description="Your Events, Sessions, and students."
        actions={
          eligible ? (
            <Button render={<Link href="/instructor/events/new">Create Event</Link>} nativeButton={false} />
          ) : undefined
        }
      />

      {!eligible && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700">
          {INELIGIBLE_MESSAGE}
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md"
            >
              <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-emerald-400 to-indigo-500 opacity-80" />
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  {card.label}
                </span>
                <Icon size={16} className="text-indigo-500/70" />
              </div>
              <div>
                <p className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">{card.value}</p>
                <Link
                  href={card.href}
                  className="mt-3 flex items-center gap-1 text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-500"
                >
                  View details <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action required */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Action Required</h2>
        {sessionsMissingLink.length === 0 ? (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
            <CheckCircle size={18} className="text-emerald-500" />
            Nothing needs attention right now.
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {sessionsMissingLink.map((s) => (
              <Link
                key={s.id}
                href={`/instructor/events/${s.event.id}?tab=sessions`}
                className="flex items-start gap-3 rounded-xl border border-l-4 border-amber-100 border-l-amber-500 bg-amber-50/40 p-4 text-sm text-slate-700 shadow-sm transition-colors hover:bg-slate-100/60"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-slate-600 opacity-70" />
                <span className="flex-1 font-medium">
                  {s.title} needs a meeting link ({s.startAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })})
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Drafts", status: "DRAFT" },
          { label: "Pending Approval", status: "PENDING_APPROVAL" },
          { label: "Published", status: "PUBLISHED" },
          { label: "Needs Changes", status: "CHANGES_REQUESTED" },
        ].map((card) => (
          <div key={card.status} className="rounded-2xl border border-slate-200 bg-white p-5">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              {card.label}
            </span>
            <p className="mt-2 text-2xl font-bold text-slate-900">{countFor(card.status)}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Upcoming Sessions</h2>
          <Link href="/instructor/calendar" className="text-sm font-medium text-indigo-600 hover:underline">
            See Calendar →
          </Link>
        </div>
        <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {upcomingSessions.length === 0 && (
            <p className="p-4 text-sm text-slate-500">No upcoming Sessions.</p>
          )}
          {upcomingSessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-4 p-4 text-sm">
              <div>
                <p className="font-medium text-slate-900">
                  {s.event.title} — {s.title}
                </p>
                <p className="text-slate-500">
                  {s.startAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
