import Link from "next/link";

import { requireInstructor } from "@/lib/permissions";
import { getInstructorAttendanceSummary } from "@/lib/instructors/queries";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";

export default async function InstructorAttendancePage() {
  const { instructor } = await requireInstructor();
  const sessions = await getInstructorAttendanceSummary(instructor.id);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Attendance" description="Mark attendance for any Session across your Events." />

      <AdminTable
        rowKey={(s) => s.id}
        rows={sessions}
        emptyMessage="No Sessions to take attendance for yet."
        columns={[
          {
            key: "session",
            label: "Session",
            render: (s) => (
              <div>
                <p className="font-medium text-slate-900">
                  {s.sequence}. {s.title}
                </p>
                <p className="text-xs text-slate-500">{s.eventTitle}</p>
              </div>
            ),
          },
          {
            key: "date",
            label: "Date",
            render: (s) => s.startAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }),
          },
          { key: "status", label: "Status", render: (s) => s.status.replace(/_/g, " ") },
          {
            key: "attendance",
            label: "Present / Marked",
            render: (s) => `${s.present} / ${s.totalMarked}`,
          },
          {
            key: "action",
            label: "",
            render: (s) => (
              <Link
                href={`/instructor/events/${s.eventId}/attendance/${s.id}`}
                className="text-xs text-blue-400 hover:underline"
              >
                Take attendance →
              </Link>
            ),
          },
        ]}
      />
    </div>
  );
}
