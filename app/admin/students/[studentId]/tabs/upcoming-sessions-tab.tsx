import { AdminTable } from "@/components/admin/admin-table";
import { getStudentUpcomingSessions } from "@/lib/admin/student-detail";

export async function UpcomingSessionsTab({ userId }: { userId: string }) {
  const sessions = await getStudentUpcomingSessions(userId);

  return (
    <AdminTable
      rowKey={(s) => s.id}
      rows={sessions}
      emptyMessage="No upcoming sessions."
      columns={[
        { key: "session", label: "Session", render: (s) => s.title },
        { key: "event", label: "Event", render: (s) => s.event.title },
        {
          key: "when",
          label: "Date/Time",
          render: (s) =>
            s.startAt.toLocaleString("en-US", {
              timeZone: "Asia/Dhaka",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            }),
        },
        { key: "status", label: "Status", render: (s) => s.status.replace(/_/g, " ") },
      ]}
    />
  );
}
