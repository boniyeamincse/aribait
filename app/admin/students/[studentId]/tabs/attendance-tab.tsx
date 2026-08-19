import { AdminTable } from "@/components/admin/admin-table";
import { getStudentAttendance } from "@/lib/admin/student-detail";

const STATUS_COLORS: Record<string, string> = {
  PRESENT: "text-emerald-400",
  LATE: "text-amber-400",
  ABSENT: "text-red-400",
  EXCUSED: "text-slate-600",
};

export async function AttendanceTab({ userId }: { userId: string }) {
  const attendance = await getStudentAttendance(userId);

  return (
    <AdminTable
      rowKey={(a) => a.id}
      rows={attendance}
      emptyMessage="No attendance records yet."
      columns={[
        { key: "event", label: "Event", render: (a) => a.eventSession.event.title },
        { key: "session", label: "Session", render: (a) => a.eventSession.title },
        {
          key: "when",
          label: "Session Date",
          render: (a) => a.eventSession.startAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        },
        {
          key: "status",
          label: "Status",
          render: (a) => (
            <span className={a.status ? STATUS_COLORS[a.status] : "text-slate-600"}>
              {a.status ?? "Not marked"}
            </span>
          ),
        },
        {
          key: "joined",
          label: "Joined",
          render: (a) => (a.joinedAt ? a.joinedAt.toLocaleTimeString("en-US", { timeZone: "Asia/Dhaka" }) : "—"),
        },
      ]}
    />
  );
}
