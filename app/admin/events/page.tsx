import Link from "next/link";

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
  REGISTRATION_OPEN: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  REGISTRATION_CLOSED: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ONGOING: "bg-green-500/15 text-green-400 border-green-500/30",
  COMPLETED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  CANCELLED: "bg-red-500/15 text-red-400 border-red-500/30",
  ARCHIVED: "bg-slate-200/15 text-slate-600 border-slate-300/30",
};

const STATUS_OPTIONS = Object.keys(STATUS_COLORS) as EventStatus[];

export default async function AdminEventsPage(props: PageProps<"/admin/events">) {
  const searchParams = await props.searchParams;
  const query = typeof searchParams.q === "string" ? searchParams.q : "";
  const statusFilter = typeof searchParams.status === "string" ? searchParams.status : "";

  const validStatus = STATUS_OPTIONS.includes(statusFilter as EventStatus)
    ? (statusFilter as EventStatus)
    : undefined;

  const events = await prisma.event.findMany({
    where: {
      ...(query ? { title: { contains: query, mode: "insensitive" } } : {}),
      ...(validStatus ? { status: validStatus } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      category: true,
      instructor: true,
      _count: { select: { registrations: { where: { status: "CONFIRMED" } }, sessions: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Events"
        description="Manage every live class, training program, workshop and seminar."
        actions={<Button render={<Link href="/admin/events/new">Create Event</Link>} nativeButton={false} />}
      />

      <form className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search events…"
          className="min-w-48 flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
        />
        <select
          name="status"
          defaultValue={validStatus ?? ""}
          className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-gradient-to-r from-blue-500 to-green-600 px-4 py-2 text-sm font-semibold text-slate-900 hover:from-blue-400 hover:to-green-500"
        >
          Filter
        </button>
      </form>

      <AdminTable
        rowKey={(event) => event.id}
        rows={events}
        emptyMessage="No Events match this filter."
        columns={[
          {
            key: "title",
            label: "Event",
            render: (event) => (
              <Link href={`/admin/events/${event.id}`} className="font-medium text-slate-900 hover:underline">
                {event.title}
                <span className="block text-xs font-normal text-slate-500">
                  {event.category.name} · {event.instructor.name}
                </span>
              </Link>
            ),
          },
          {
            key: "sessions",
            label: "Sessions",
            render: (event) => event._count.sessions,
          },
          {
            key: "capacity",
            label: "Capacity",
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
              <Link href={`/admin/events/${event.id}`} className="text-xs text-blue-400 hover:underline">
                Manage →
              </Link>
            ),
          },
        ]}
      />
    </div>
  );
}
