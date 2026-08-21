import { requireInstructor } from "@/lib/permissions";
import { getInstructorStudents } from "@/lib/instructors/queries";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";

const REGISTRATION_STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  CONFIRMED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  WAITLISTED: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  CANCELLED: "bg-red-500/15 text-red-400 border-red-500/30",
  EXPIRED: "bg-slate-500/15 text-slate-600 border-slate-500/30",
  REFUNDED: "bg-slate-500/15 text-slate-600 border-slate-500/30",
  COMPLETED: "bg-green-500/15 text-green-400 border-green-500/30",
};

export default async function InstructorStudentsPage() {
  const { instructor } = await requireInstructor();
  const students = await getInstructorStudents(instructor.id);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Students"
        description="Everyone registered for one of your Events, across all Events."
      />

      <AdminTable
        rowKey={(s) => s.user.id}
        rows={students}
        emptyMessage="No students yet."
        columns={[
          {
            key: "student",
            label: "Student",
            render: (s) => (
              <div>
                <p className="font-medium text-slate-900">{s.user.name ?? s.user.email}</p>
                <p className="text-xs text-slate-500">{s.user.email}</p>
              </div>
            ),
          },
          {
            key: "events",
            label: "Your Events",
            render: (s) => `${s.eventCount} Event${s.eventCount === 1 ? "" : "s"}`,
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
