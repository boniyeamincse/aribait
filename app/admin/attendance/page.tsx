import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { prisma } from "@/lib/db/client";

export default async function AdminAttendancePage() {
  const sessions = await prisma.eventSession.findMany({
    where: { status: { not: "CANCELLED" } },
    orderBy: { startAt: "desc" },
    take: 100,
    include: {
      event: true,
      _count: {
        select: { attendances: { where: { status: { not: null } } } },
      },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Attendance" description="Pick a Session to mark or review attendance." />

      <AdminTable
        rowKey={(s) => s.id}
        rows={sessions}
        emptyMessage="No Sessions yet."
        columns={[
          {
            key: "session",
            label: "Session",
            render: (s) => (
              <Link href={`/admin/attendance/${s.id}`} className="font-medium text-slate-900 hover:underline">
                {s.event.title} — {s.title}
              </Link>
            ),
          },
          {
            key: "when",
            label: "Date/Time",
            render: (s) => s.startAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }),
          },
          { key: "marked", label: "Marked", render: (s) => s._count.attendances },
          { key: "status", label: "Status", render: (s) => s.status.replace(/_/g, " ") },
        ]}
      />
    </div>
  );
}
