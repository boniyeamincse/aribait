import Link from "next/link";

import { requireInstructor } from "@/lib/permissions";
import { getInstructorSessions } from "@/lib/instructors/queries";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { Badge } from "@/components/ui/badge";

export default async function InstructorSessionsPage() {
  const { instructor } = await requireInstructor();
  const sessions = await getInstructorSessions(instructor.id);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Sessions" description="Every Session across your Events." />

      <AdminTable
        rowKey={(s) => s.id}
        rows={sessions}
        emptyMessage="No Sessions yet."
        columns={[
          {
            key: "session",
            label: "Session",
            render: (s) => (
              <div>
                <p className="font-medium text-slate-900">
                  {s.sequence}. {s.title}
                </p>
                <p className="text-xs text-slate-500">{s.event.title}</p>
              </div>
            ),
          },
          {
            key: "date",
            label: "Date",
            render: (s) => s.startAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }),
          },
          { key: "platform", label: "Platform", render: (s) => s.platform.replace(/_/g, " ") },
          { key: "status", label: "Status", render: (s) => <Badge variant="secondary">{s.status}</Badge> },
          {
            key: "actions",
            label: "",
            render: (s) => (
              <Link
                href={`/instructor/events/${s.event.id}?tab=sessions`}
                className="text-xs text-blue-400 hover:underline"
              >
                Manage →
              </Link>
            ),
          },
        ]}
      />
    </div>
  );
}
