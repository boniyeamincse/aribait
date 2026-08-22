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
  Sparkles,
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
      include: { event: { select: { title: true, slug: true, type: true, startAt: true } } },
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
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 p-8 text-white shadow-2xl shadow-indigo-900/30">
        {/* Decorative dynamic circles */}
        <div className="absolute -left-20 -top-20 h-64 w-64 animate-pulse rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-10 h-80 w-80 animate-pulse rounded-full bg-purple-500/20 blur-3xl delay-700" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-indigo-200 text-sm font-medium flex items-center gap-1.5"><Sparkles size={14} />{greeting},</p>
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
              className="group relative flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-md transition-all hover:bg-white/20 hover:scale-[1.02] hover:shadow-xl shrink-0"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-indigo-100 shadow-inner group-hover:bg-white/30 transition-colors">
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
              className="group flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-indigo-900 shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] transition-all hover:scale-105 hover:bg-indigo-50 hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.7)] shrink-0"
            >
              Browse Courses
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
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
              className="group relative flex flex-col gap-3 rounded-[1.5rem] border border-white/40 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 hover:bg-white/80 overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-[0.05] group-hover:opacity-10 transition-opacity duration-300" style={{ backgroundImage: `var(--tw-gradient-stops)` }} />
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.bg} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 flex items-center gap-2.5">
            <TrendingUp size={22} className="text-indigo-600" />
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
                className="group flex items-center gap-5 rounded-[1.5rem] border border-white/50 bg-white/70 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
                  <CalendarDays size={24} />
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
              className="group flex flex-col items-center gap-3 rounded-[1.5rem] border border-white/40 bg-white/60 p-5 text-center shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5"
            >
              <div className="rounded-2xl bg-slate-50 p-3 transition-colors group-hover:bg-slate-100">
                <Icon size={26} className={`${item.color} group-hover:scale-110 transition-transform duration-300`} />
              </div>
              <span className="text-[13px] font-bold text-slate-700">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
