import Link from "next/link";

import { requireInstructor } from "@/lib/permissions";
import { isEligibleToCreateEvents } from "@/lib/instructors/eligibility";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db/client";
import type { EventStatus } from "@/lib/generated/prisma/client";
import { formatBdt } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-slate-500/15 text-slate-600 border-slate-500/30",
  PENDING_APPROVAL: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  CHANGES_REQUESTED: "bg-orange-500/15 text-orange-600 border-orange-500/30",
  APPROVED: "bg-teal-500/15 text-teal-600 border-teal-500/30",
  REJECTED: "bg-red-500/15 text-red-400 border-red-500/30",
  PUBLISHED: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  ONGOING: "bg-green-500/15 text-green-400 border-green-500/30",
  COMPLETED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  CANCELLED: "bg-red-500/15 text-red-400 border-red-500/30",
  ARCHIVED: "bg-slate-200/15 text-slate-600 border-slate-300/30",
};

export default async function InstructorEventsPage(props: PageProps<"/instructor/events">) {
  const { user, instructor } = await requireInstructor();
  const eligible = isEligibleToCreateEvents(user, instructor);

  const searchParams = await props.searchParams;
  const statusFilter = typeof searchParams.status === "string" ? searchParams.status : "";
  const validStatus = Object.keys(STATUS_COLORS).includes(statusFilter)
    ? (statusFilter as EventStatus)
    : undefined;

  const events = await prisma.event.findMany({
    where: { instructorId: instructor.id, ...(validStatus ? { status: validStatus } : {}) },
    orderBy: { createdAt: "desc" },
    include: { category: true, _count: { select: { registrations: { where: { status: "CONFIRMED" } } } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={validStatus ? `My Events — ${validStatus.replace(/_/g, " ")}` : "My Events"}
        description="Events you've created — draft, submitted for approval, or published."
        actions={
          eligible ? (
            <Button render={<Link href="/instructor/events/new">Create Event</Link>} nativeButton={false} />
          ) : undefined
        }
      />

      <AdminTable
        rowKey={(event) => event.id}
        rows={events}
        emptyMessage="You haven't created any Events yet."
        columns={[
          {
            key: "title",
            label: "Event",
            render: (event) => (
              <Link href={`/instructor/events/${event.id}`} className="font-medium text-slate-900 hover:underline">
                {event.title}
                <span className="block text-xs font-normal text-slate-500">{event.category.name}</span>
              </Link>
            ),
          },
          {
            key: "capacity",
            label: "Registrations",
            render: (event) =>
              event.capacity === null
                ? `${event._count.registrations} / unlimited`
                : `${event._count.registrations} / ${event.capacity}`,
          },
          { key: "price", label: "Price", render: (event) => formatBdt(event.priceBdt) },
          {
            key: "status",
            label: "Status",
            render: (event) => <StatusBadge status={event.status} map={STATUS_COLORS} />,
          },
          {
            key: "actions",
            label: "",
            render: (event) => (
              <Link href={`/instructor/events/${event.id}`} className="text-xs text-blue-400 hover:underline">
                Manage →
              </Link>
            ),
          },
        ]}
      />
    </div>
  );
}
