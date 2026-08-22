import { BookOpen, User } from "lucide-react";

import { requireInstructor } from "@/lib/permissions";
import { getInstructorStudents } from "@/lib/instructors/queries";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";

const REGISTRATION_STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-700 border-amber-200",
  CONFIRMED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  WAITLISTED: "bg-blue-100 text-blue-700 border-blue-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
  EXPIRED: "bg-slate-100 text-slate-700 border-slate-200",
  REFUNDED: "bg-orange-100 text-orange-700 border-orange-200",
  COMPLETED: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

export default async function InstructorStudentsPage() {
  const { instructor } = await requireInstructor();
  const students = await getInstructorStudents(instructor.id);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <AdminPageHeader
        title="Student Directory"
        description="A unified roster of everyone registered across all your active and past events."
      />

      <AdminTable
        rowKey={(s) => s.user.id}
        rows={students}
        emptyMessage="No students yet."
        columns={[
          {
            key: "student",
            label: "Student Info",
            render: (s) => (
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold uppercase overflow-hidden">
                  {s.user.name ? s.user.name.slice(0, 2) : <User size={18} />}
                </div>
                <div className="flex flex-col">
                  <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {s.user.name ?? "Unknown Learner"}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500 tracking-wide">
                    {s.user.email}
                  </p>
                </div>
              </div>
            ),
          },
          {
            key: "events",
            label: "Enrolled Events",
            render: (s) => (
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-slate-500">
                  <BookOpen size={12} />
                </div>
                <span className="text-sm font-bold text-slate-700">
                  {s.eventCount} <span className="text-slate-400 font-medium">Event{s.eventCount === 1 ? "" : "s"}</span>
                </span>
              </div>
            ),
          },
          {
            key: "status",
            label: "Latest Status",
            render: (s) => <StatusBadge status={s.latestStatus} map={REGISTRATION_STATUS_COLORS} />,
          },
        ]}
      />
    </div>
  );
}
