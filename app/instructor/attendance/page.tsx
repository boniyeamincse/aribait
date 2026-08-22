import Link from "next/link";
import { BookCheck, Calendar, Clock, ArrowRight, CheckCircle2, LayoutList } from "lucide-react";

import { requireInstructor } from "@/lib/permissions";
import { getInstructorAttendanceSummary } from "@/lib/instructors/queries";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";

const SESSION_STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "bg-slate-100 text-slate-700 border-slate-200",
  JOIN_OPEN: "bg-cyan-100 text-cyan-700 border-cyan-200",
  LIVE: "bg-rose-100 text-rose-700 border-rose-200",
  COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  RESCHEDULED: "bg-amber-100 text-amber-700 border-amber-200",
  CANCELLED: "bg-slate-200/50 text-slate-500 border-slate-200",
};

export default async function InstructorAttendancePage() {
  const { instructor } = await requireInstructor();
  const sessions = await getInstructorAttendanceSummary(instructor.id);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <AdminPageHeader 
        title="Attendance Management" 
        description="Mark and track attendance for all your scheduled and completed sessions." 
      />

      <AdminTable
        rowKey={(s) => s.id}
        rows={sessions}
        emptyMessage="No Sessions to take attendance for yet."
        columns={[
          {
            key: "session",
            label: "Session Details",
            render: (s) => (
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500 border border-indigo-100">
                  <BookCheck size={20} />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    <span className="text-slate-400 font-medium mr-1">#{s.sequence}</span> {s.title}
                  </p>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                    <LayoutList size={12} className="text-slate-400" />
                    {s.eventTitle}
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
            key: "status", 
            label: "Status", 
            render: (s) => <StatusBadge status={s.status} map={SESSION_STATUS_COLORS} /> 
          },
          {
            key: "attendance",
            label: "Present / Marked",
            render: (s) => (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span>
                    {s.present} <span className="text-slate-400 font-medium text-xs">/ {s.totalMarked}</span>
                  </span>
                </div>
                <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all" 
                    style={{ width: s.totalMarked > 0 ? `${Math.min((s.present / s.totalMarked) * 100, 100)}%` : '0%' }}
                  />
                </div>
              </div>
            ),
          },
          {
            key: "action",
            label: "",
            render: (s) => (
              <div className="flex justify-end">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 gap-1.5 rounded-full px-4"
                  render={<Link href={`/instructor/events/${s.eventId}/attendance/${s.id}`}>Record <ArrowRight size={14} /></Link>}
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
