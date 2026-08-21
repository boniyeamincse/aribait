import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  Award,
  Bell,
  CreditCard,
  MonitorPlay,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/permissions";

export default async function DashboardOverviewPage() {
  const user = await requireUser();

  const [
    enrolledEvents,
    upcomingSessions,
    completedEvents,
    pendingPayments,
    unreadNotifications,
    certificates,
    recentRegistrations,
    nextSession,
  ] = await Promise.all([
    prisma.registration.count({
      where: { userId: user.id, status: "CONFIRMED" },
    }),
    prisma.eventSession.count({
      where: {
        startAt: { gte: new Date() },
        status: { in: ["SCHEDULED", "JOIN_OPEN", "LIVE", "RESCHEDULED"] },
        event: {
          registrations: { some: { userId: user.id, status: "CONFIRMED" } },
        },
      },
    }),
    prisma.registration.count({
      where: { userId: user.id, status: "COMPLETED" },
    }),
    prisma.payment.count({
      where: {
        registration: { userId: user.id },
        status: { in: ["INITIATED", "PENDING", "FAILED"] },
      },
    }),
    prisma.notification.count({
      where: { userId: user.id, readAt: null },
    }),
    prisma.certificate.count({
      where: { registration: { userId: user.id }, status: "ISSUED" },
    }),
    prisma.registration.findMany({
      where: { userId: user.id, status: "CONFIRMED" },
      take: 4,
      orderBy: { createdAt: "desc" },
      include: { event: { select: { title: true, slug: true, type: true, startDate: true } } },
    }),
    prisma.eventSession.findFirst({
      where: {
        startAt: { gte: new Date() },
        status: { in: ["SCHEDULED", "JOIN_OPEN", "LIVE"] },
        event: {
          registrations: { some: { userId: user.id, status: "CONFIRMED" } },
        },
      },
      orderBy: { startAt: "asc" },
      include: { event: { select: { title: true } } },
    }),
  ]);

  const statCards = [
    {
      label: "Enrolled Courses",
      value: enrolledEvents,
      icon: BookOpen,
      color: "from-indigo-500 to-indigo-600",
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      href: "/dashboard/events",
    },
    {
      label: "Upcoming Sessions",
      value: upcomingSessions,
      icon: MonitorPlay,
      color: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      href: "/dashboard/sessions",
    },
    {
      label: "Completed",
      value: completedEvents,
      icon: CheckCircle2,
      color: "from-sky-500 to-sky-600",
      bg: "bg-sky-50",
      text: "text-sky-600",
      href: "/dashboard/events",
    },
    {
      label: "Certificates",
      value: certificates,
      icon: Award,
      color: "from-amber-500 to-orange-500",
      bg: "bg-amber-50",
      text: "text-amber-600",
      href: "/dashboard/certificates",
    },
    {
      label: "Notifications",
      value: unreadNotifications,
      icon: Bell,
      color: "from-violet-500 to-purple-600",
      bg: "bg-violet-50",
      text: "text-violet-600",
      href: "/dashboard/notifications",
    },
    {
      label: "Pending Payments",
      value: pendingPayments,
      icon: CreditCard,
      color: "from-rose-500 to-red-500",
      bg: "bg-rose-50",
      text: "text-rose-600",
      href: "/dashboard/payments",
    },
  ];

  const firstName = (user.name ?? "Student").split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-6 text-white shadow-lg shadow-indigo-500/20">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-8 right-16 h-32 w-32 rounded-full bg-white/5" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-indigo-200 text-sm font-medium">{greeting} 👋</p>
            <h1 className="text-2xl font-bold mt-0.5">{firstName}!</h1>
            <p className="text-indigo-200 text-sm mt-1">
              {enrolledEvents > 0
                ? `You have ${enrolledEvents} active course${enrolledEvents > 1 ? "s" : ""} and ${upcomingSessions} upcoming session${upcomingSessions !== 1 ? "s" : ""}.`
                : "Start your learning journey by enrolling in a course."}
            </p>
          </div>
          {nextSession ? (
            <Link
              href="/dashboard/sessions"
              className="flex items-center gap-3 rounded-xl bg-white/15 px-4 py-3 backdrop-blur-sm hover:bg-white/20 transition-colors shrink-0"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                <MonitorPlay size={18} />
              </div>
              <div>
                <p className="text-xs text-indigo-200">Next Session</p>
                <p className="text-sm font-semibold line-clamp-1 max-w-[160px]">{nextSession.event.title}</p>
              </div>
              <ArrowRight size={16} className="text-indigo-200" />
            </Link>
          ) : (
            <Link
              href="/events"
              className="flex items-center gap-2 rounded-xl bg-white text-indigo-700 px-5 py-2.5 text-sm font-bold hover:bg-indigo-50 transition-colors shadow-md shrink-0"
            >
              Browse Courses
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bg}`}>
                <Icon size={20} className={card.text} />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{card.value}</p>
                <p className="text-sm text-slate-500 mt-0.5">{card.label}</p>
              </div>
              <div className={`h-0.5 w-0 rounded-full bg-gradient-to-r ${card.color} transition-all duration-300 group-hover:w-full`} />
            </Link>
          );
        })}
      </div>

      {/* Recent Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-500" />
            My Courses
          </h2>
          <Link
            href="/dashboard/events"
            className="flex items-center gap-1 text-sm text-indigo-600 font-semibold hover:text-indigo-700"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {recentRegistrations.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 mb-4">
              <BookOpen size={24} className="text-indigo-400" />
            </div>
            <p className="text-slate-700 font-semibold">No courses yet</p>
            <p className="text-sm text-slate-500 mt-1">Enroll in a course to get started.</p>
            <Link
              href="/events"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
            >
              Browse Courses <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {recentRegistrations.map((reg) => (
              <Link
                key={reg.id}
                href={`/dashboard/events/${reg.event?.slug ?? ""}`}
                className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-200"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm">
                  <CalendarDays size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 line-clamp-1">{reg.event?.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 capitalize">{reg.event?.type?.replace("_", " ").toLowerCase()}</p>
                </div>
                <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "My Certificates", icon: Award, href: "/dashboard/certificates", color: "text-amber-500" },
          { label: "Attendance", icon: CheckCircle2, href: "/dashboard/attendance", color: "text-emerald-500" },
          { label: "Payments", icon: CreditCard, href: "/dashboard/payments", color: "text-sky-500" },
          { label: "Notifications", icon: Bell, href: "/dashboard/notifications", color: "text-violet-500" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <Icon size={22} className={item.color} />
              <span className="text-xs font-semibold text-slate-700">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
