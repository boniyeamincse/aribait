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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{event.title}</h1>
          <p className="text-sm text-slate-600">
            /events/{event.slug} · {formatBdt(event.priceBdt)} · {event._count.registrations} registration
            {event._count.registrations === 1 ? "" : "s"}
          </p>
        </div>
        <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-400">
          {event.status.replace(/_/g, " ")}
        </span>
      </div>

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
