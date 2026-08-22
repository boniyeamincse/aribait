import { notFound } from "next/navigation";

import { TabBar } from "@/components/admin/tab-bar";
import { prisma } from "@/lib/db/client";
import { formatBdt } from "@/lib/utils";

import { OverviewTab } from "./tabs/overview-tab";
import { SessionsTab } from "./tabs/sessions-tab";
import { RegistrationsTab } from "./tabs/registrations-tab";
import { PaymentsTab } from "./tabs/payments-tab";
import { AttendanceTab } from "./tabs/attendance-tab";
import { NotificationsTab } from "./tabs/notifications-tab";
import { CertificatesTab } from "./tabs/certificates-tab";
import { ActivityTab } from "./tabs/activity-tab";

import {
  LayoutDashboard,
  MonitorPlay,
  ClipboardList,
  CreditCard,
  CheckSquare,
  Bell,
  Award,
  Activity,
} from "lucide-react";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "sessions", label: "Sessions", icon: MonitorPlay },
  { id: "registrations", label: "Registrations", icon: ClipboardList },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "attendance", label: "Attendance", icon: CheckSquare },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "activity", label: "Activity Log", icon: Activity },
];

export default async function AdminEventDetailPage(
  props: PageProps<"/admin/events/[id]">,
) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const tab = typeof searchParams.tab === "string" ? searchParams.tab : "overview";

  const [event, categories, instructors] = await Promise.all([
    prisma.event.findUnique({
      where: { id },
      include: {
        instructor: true,
        sessions: { orderBy: { sequence: "asc" } },
        discountEvents: { include: { discount: true } },
        resources: { orderBy: { createdAt: "asc" } },
        reviews: { orderBy: { createdAt: "desc" }, include: { user: true } },
        _count: { select: { registrations: true } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.instructor.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!event) notFound();

  return (
    <div className="flex flex-col gap-6">
      {/* Premium Header / Hero Section */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Cover Background */}
        <div 
          className="absolute inset-0 h-32 w-full opacity-20 bg-cover bg-center"
          style={{ 
            backgroundImage: event.thumbnailUrl 
              ? `url(${event.thumbnailUrl})` 
              : "linear-gradient(to right, #4f46e5, #06b6d4)" 
          }}
        />
        <div className="absolute inset-0 h-32 w-full bg-gradient-to-b from-white/10 to-white" />
        
        {/* Content */}
        <div className="relative p-6 pt-12 sm:p-8 sm:pt-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                  event.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                  event.status === "DRAFT" ? "bg-slate-100 text-slate-700 border-slate-200" :
                  event.status === "PENDING_APPROVAL" ? "bg-amber-100 text-amber-700 border-amber-200" :
                  "bg-indigo-100 text-indigo-700 border-indigo-200"
                } border`}>
                  {event.status.replace(/_/g, " ")}
                </span>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                  {event.type}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
                {event.title}
              </h1>
              <p className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <a 
                  href={`/events/${event.slug}`} 
                  target="_blank" 
                  className="flex items-center gap-1 text-indigo-600 hover:underline"
                >
                  <Activity size={14} /> /events/{event.slug}
                </a>
                <span>·</span>
                <span>{event.instructor.name}</span>
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex shrink-0 gap-4 rounded-xl border border-slate-200 bg-white/60 p-3 backdrop-blur-md">
              <div className="flex flex-col px-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Price</span>
                <span className="text-lg font-bold text-slate-900">{formatBdt(event.priceBdt)}</span>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div className="flex flex-col px-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Registrations</span>
                <span className="text-lg font-bold text-slate-900">
                  {event._count.registrations} <span className="text-sm font-normal text-slate-500">/ {event.capacity}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <TabBar tabs={TABS} active={tab} baseHref={`/admin/events/${event.id}`} />

      {tab === "overview" && (
        <OverviewTab event={event} categories={categories} instructors={instructors} />
      )}
      {tab === "sessions" && (
        <SessionsTab event={event} instructors={instructors} />
      )}
      {tab === "registrations" && <RegistrationsTab eventId={event.id} />}
      {tab === "payments" && <PaymentsTab eventId={event.id} />}
      {tab === "attendance" && <AttendanceTab eventId={event.id} />}
      {tab === "notifications" && <NotificationsTab eventId={event.id} />}
      {tab === "certificates" && <CertificatesTab eventId={event.id} />}
      {tab === "activity" && <ActivityTab eventId={event.id} />}
    </div>
  );
}
