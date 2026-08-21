import { TabBar } from "@/components/admin/tab-bar";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireOwnedEvent } from "@/lib/instructors/ownership";
import { prisma } from "@/lib/db/client";
import { formatBdt } from "@/lib/utils";

import { OverviewTab } from "./tabs/overview-tab";
import { SessionsTab } from "./tabs/sessions-tab";
import { RegistrationsTab } from "./tabs/registrations-tab";
import { AttendanceTab } from "./tabs/attendance-tab";
import { ResourcesTab } from "./tabs/resources-tab";

import { LayoutDashboard, MonitorPlay, ClipboardList, CheckSquare, FileText } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-slate-500/15 text-slate-600 border-slate-500/30",
  PENDING_APPROVAL: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  CHANGES_REQUESTED: "bg-orange-500/15 text-orange-600 border-orange-500/30",
  APPROVED: "bg-teal-500/15 text-teal-600 border-teal-500/30",
  REJECTED: "bg-red-500/15 text-red-400 border-red-500/30",
  PUBLISHED: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "sessions", label: "Sessions", icon: MonitorPlay },
  { id: "registrations", label: "Registrations", icon: ClipboardList },
  { id: "attendance", label: "Attendance", icon: CheckSquare },
  { id: "resources", label: "Resources", icon: FileText },
];

export default async function InstructorEventDetailPage(
  props: PageProps<"/instructor/events/[id]">,
) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const tab = typeof searchParams.tab === "string" ? searchParams.tab : "overview";

  const { instructor } = await requireOwnedEvent(id);

  const [event, categories] = await Promise.all([
    prisma.event.findUniqueOrThrow({
      where: { id },
      include: {
        sessions: { orderBy: { sequence: "asc" } },
        resources: { orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{event.title}</h1>
          <p className="text-sm text-slate-600">
            {formatBdt(event.priceBdt)} · {event.type.replace(/_/g, " ")}
          </p>
        </div>
        <StatusBadge status={event.status} map={STATUS_COLORS} />
      </div>

      <TabBar tabs={TABS} active={tab} baseHref={`/instructor/events/${event.id}`} />

      {tab === "overview" && <OverviewTab event={event} categories={categories} />}
      {tab === "sessions" && <SessionsTab event={event} instructor={instructor} />}
      {tab === "registrations" && <RegistrationsTab eventId={event.id} />}
      {tab === "attendance" && <AttendanceTab eventId={event.id} />}
      {tab === "resources" && <ResourcesTab event={event} />}
    </div>
  );
}
