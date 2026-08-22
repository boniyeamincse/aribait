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
        title="Events Management"
        description="Manage all live classes, training programs, workshops, and seminars."
        actions={<Button render={<Link href="/admin/events/new">Create Event</Link>} nativeButton={false} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" />}
      />

      {/* Modern Filter Section */}
      <form className="flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative w-full sm:w-72 sm:max-w-xs shrink-0">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search events by title..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>
        <select
          name="status"
          defaultValue={validStatus ?? ""}
          className="w-full sm:w-auto rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="w-full sm:w-auto rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
        >
          Filter Results
        </button>
      </form>

      {/* Premium Table */}
      <div className="flex flex-col gap-4">
        <AdminTable
          rowKey={(event) => event.id}
          rows={events}
          emptyMessage="No Events match this filter."
          columns={[
            {
              key: "title",
              label: "Event Info",
              render: (event) => (
                <Link href={`/admin/events/${event.id}`} className="group flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                    {event.thumbnailUrl ? (
                      <img src={event.thumbnailUrl} alt={event.title} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-indigo-50 text-indigo-300">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{event.title}</span>
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                      <span className="text-indigo-600">{event.category.name}</span>
                      <span>·</span>
                      <span>{event.instructor.name}</span>
                    </span>
                  </div>
                </Link>
              ),
            },
            {
              key: "sessions",
              label: "Sessions",
              render: (event) => (
                <span className="font-medium text-slate-700">{event._count.sessions} classes</span>
              ),
            },
            {
              key: "capacity",
              label: "Registrations",
              render: (event) => {
                const regs = event._count.registrations;
                const cap = event.capacity;
                const isUnlimited = cap === null;
                const percent = isUnlimited ? 0 : Math.min(100, Math.round((regs / cap!) * 100));
                
                return (
                  <div className="flex flex-col gap-1 w-32">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-900">{regs}</span>
                      <span className="text-slate-500">{isUnlimited ? "Unlimited" : `/ ${cap}`}</span>
                    </div>
                    {!isUnlimited && (
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${percent >= 100 ? 'bg-red-500' : percent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              }
            },
            { 
              key: "price", 
              label: "Price", 
              render: (event) => <span className="font-bold text-slate-900">{formatBdt(event.priceBdt)}</span> 
            },
            {
              key: "status",
              label: "Status",
              render: (event) => <StatusBadge status={event.status} map={STATUS_COLORS} />,
            },
            {
              key: "actions",
              label: "Action",
              render: (event) => (
                <Button
                  render={<Link href={`/admin/events/${event.id}`}>Manage</Link>}
                  nativeButton={false}
                  size="sm"
                  variant="outline"
                  className="bg-white hover:bg-slate-50 text-slate-700 font-medium shadow-sm"
                />
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
