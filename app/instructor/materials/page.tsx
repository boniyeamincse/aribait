import Link from "next/link";

import { requireInstructor } from "@/lib/permissions";
import { getInstructorResources } from "@/lib/instructors/queries";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";

export default async function InstructorMaterialsPage() {
  const { instructor } = await requireInstructor();
  const resources = await getInstructorResources(instructor.id);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Materials"
        description="Course materials and links attached to your Events."
      />

      <AdminTable
        rowKey={(r) => r.id}
        rows={resources}
        emptyMessage="No materials added yet — add some from an Event's Resources tab."
        columns={[
          {
            key: "title",
            label: "Title",
            render: (r) => (
              <div>
                <p className="font-medium text-slate-900">{r.title}</p>
                <p className="truncate text-xs text-slate-500">{r.url}</p>
              </div>
            ),
          },
          { key: "event", label: "Event", render: (r) => r.event.title },
          {
            key: "actions",
            label: "",
            render: (r) => (
              <Link
                href={`/instructor/events/${r.event.id}?tab=resources`}
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
