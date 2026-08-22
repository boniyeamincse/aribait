import Link from "next/link";
import { PlayCircle, Clock, Calendar, Video, ArrowRight, LayoutList } from "lucide-react";

import { requireInstructor } from "@/lib/permissions";
import { getInstructorSessions } from "@/lib/instructors/queries";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";

const SESSION_STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "bg-slate-100 text-slate-700 border-slate-200",
  JOIN_OPEN: "bg-cyan-100 text-cyan-700 border-cyan-200",
  LIVE: "bg-rose-100 text-rose-700 border-rose-200",
  COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  RESCHEDULED: "bg-amber-100 text-amber-700 border-amber-200",
  CANCELLED: "bg-slate-200/50 text-slate-500 border-slate-200",
};

export default async function InstructorSessionsPage() {
  const { instructor } = await requireInstructor();
  const sessions = await getInstructorSessions(instructor.id);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <AdminPageHeader 
        title="Session Directory" 
        description="Comprehensive list of all your scheduled, live, and past sessions." 
      />

      <AdminTable
        rowKey={(s) => s.id}
        rows={sessions}
        emptyMessage="No Sessions yet."
        columns={[
          {
            key: "session",
            label: "Session Details",
            render: (s) => (
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500 border border-indigo-100">
                  <PlayCircle size={20} />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    <span className="text-slate-400 font-medium mr-1">#{s.sequence}</span> {s.title}
                  </p>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                    <LayoutList size={12} className="text-slate-400" />
                    {s.event.title}
                  </p>
                </div>
              </div>
            ),
          },
          {
            key: "date",
            label: "Date & Time",
            render: (s) => (
              <div className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" />
                  <span>{s.startAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock size={12} className="text-slate-400" />
                  <span>{s.startAt.toLocaleTimeString("en-GB", { timeStyle: "short" })}</span>
                </div>
              </div>
            ),
          },
          { 
            key: "platform", 
            label: "Platform", 
            render: (s) => (
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-slate-500">
                  <Video size={12} />
                </div>
                <span className="text-sm font-bold text-slate-700 uppercase tracking-wide text-[11px]">
                  {s.platform.replace(/_/g, " ")}
                </span>
              </div>
            ) 
          },
          { 
            key: "status", 
            label: "Status", 
            render: (s) => <StatusBadge status={s.status} map={SESSION_STATUS_COLORS} /> 
          },
          {
            key: "actions",
            label: "",
            render: (s) => (
              <div className="flex justify-end">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 gap-1.5 rounded-full px-4"
                  render={<Link href={`/instructor/events/${s.event.id}?tab=sessions`}>Manage <ArrowRight size={14} /></Link>}
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
