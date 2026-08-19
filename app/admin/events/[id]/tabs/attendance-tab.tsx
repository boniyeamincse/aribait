import Link from "next/link";

import { AdminTable } from "@/components/admin/admin-table";
import { getEventAttendanceSummary } from "@/lib/admin/event-detail";

export async function AttendanceTab({ eventId }: { eventId: string }) {
  const sessions = await getEventAttendanceSummary(eventId);

  return (
    <AdminTable
      rowKey={(s) => s.id}
      rows={sessions}
      emptyMessage="No Sessions to take attendance for yet."
      columns={[
        {
          key: "session",
          label: "Session",
          render: (s) => (
            <span className="font-medium text-white">
              {s.sequence}. {s.title}
            </span>
          ),
        },
        {
          key: "date",
          label: "Date",
          render: (s) =>
            s.startAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }),
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
            <Link href={`/admin/attendance/${s.id}`} className="text-xs text-cyan-400 hover:underline">
              Take attendance →
            </Link>
          ),
        },
      ]}
    />
  );
}
