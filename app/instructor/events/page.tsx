import Link from "next/link";
import { FolderGit2, Users, Receipt, ArrowRight } from "lucide-react";

import { requireInstructor } from "@/lib/permissions";
import { isEligibleToCreateEvents } from "@/lib/instructors/eligibility";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db/client";
import type { EventStatus } from "@/lib/generated/prisma/client";
import { formatBdt } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600 border-slate-200",
  PENDING_APPROVAL: "bg-amber-100 text-amber-700 border-amber-200",
  CHANGES_REQUESTED: "bg-orange-100 text-orange-700 border-orange-200",
  APPROVED: "bg-teal-100 text-teal-700 border-teal-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
  PUBLISHED: "bg-indigo-100 text-indigo-700 border-indigo-200",
  ONGOING: "bg-emerald-100 text-emerald-700 border-emerald-200",
  COMPLETED: "bg-emerald-50 text-emerald-600 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
  ARCHIVED: "bg-slate-50 text-slate-500 border-slate-200",
};

const TABS = [
  { label: "All Events", status: "" },
  { label: "Drafts", status: "DRAFT" },
  { label: "Pending", status: "PENDING_APPROVAL" },
  { label: "Published", status: "PUBLISHED" },
];

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
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <AdminPageHeader
        title={validStatus ? `My Events — ${validStatus.replace(/_/g, " ")}` : "My Events"}
        description="Manage your event catalog, drafts, and published courses."
        actions={
          eligible ? (
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-medium px-5" 
              render={<Link href="/instructor/events/new">Create Event</Link>} 
              nativeButton={false} 
            />
          ) : undefined
        }
      />

      {/* Modern Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-slate-200 scrollbar-hide">
        {TABS.map((tab) => {
          const isActive = tab.status === statusFilter;
          const href = tab.status ? `/instructor/events?status=${tab.status}` : `/instructor/events`;
          return (
            <Link
              key={tab.label}
              href={href}
              className={`
                flex shrink-0 items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors
                ${isActive 
                  ? "border-indigo-600 text-indigo-700 bg-indigo-50/50" 
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"}
              `}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <AdminTable
        rowKey={(event) => event.id}
        rows={events}
        emptyMessage={validStatus ? `No events found with status ${validStatus.replace(/_/g, " ")}.` : "You haven't created any Events yet."}
        columns={[
          {
            key: "title",
            label: "Event Information",
            render: (event) => (
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 border border-slate-200">
                  <FolderGit2 size={20} />
                </div>
                <div className="flex flex-col gap-1">
                  <Link href={`/instructor/events/${event.id}`} className="font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1">
                    {event.title}
                  </Link>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{event.category.name}</span>
                </div>
              </div>
            ),
          },
          {
            key: "capacity",
            label: "Enrollment",
            render: (event) => (
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <Users size={14} className="text-slate-400" />
                {event.capacity === null
                  ? <span><span className="font-bold text-slate-900">{event._count.registrations}</span> / ∞</span>
                  : <span><span className="font-bold text-slate-900">{event._count.registrations}</span> / {event.capacity}</span>
                }
              </div>
            ),
          },
          { 
            key: "price", 
            label: "Pricing", 
            render: (event) => (
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                <Receipt size={14} className="text-emerald-500" />
                {event.priceBdt > 0 ? formatBdt(event.priceBdt) : <span className="text-emerald-600 uppercase tracking-widest text-[11px]">Free</span>}
              </div>
            ) 
          },
          {
            key: "status",
            label: "Status",
            render: (event) => (
              <Badge className={`${STATUS_COLORS[event.status] ?? "bg-slate-100 text-slate-600"} uppercase text-[10px] tracking-wide shadow-none px-2.5`}>
                {event.status.replace(/_/g, " ")}
              </Badge>
            ),
          },
          {
            key: "actions",
            label: "",
            render: (event) => (
              <div className="flex justify-end">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 gap-1.5 rounded-full px-4"
                  render={<Link href={`/instructor/events/${event.id}`}>Manage <ArrowRight size={14} /></Link>}
                  nativeButton={false}
                />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
