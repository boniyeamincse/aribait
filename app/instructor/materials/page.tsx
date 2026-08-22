import Link from "next/link";
import { FileText, Link as LinkIcon, BookOpen, ArrowRight } from "lucide-react";

import { requireInstructor } from "@/lib/permissions";
import { getInstructorResources } from "@/lib/instructors/queries";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { Button } from "@/components/ui/button";

export default async function InstructorMaterialsPage() {
  const { instructor } = await requireInstructor();
  const resources = await getInstructorResources(instructor.id);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <AdminPageHeader
        title="Course Materials"
        description="A centralized directory of all resources, documents, and links attached to your events."
      />

      <AdminTable
        rowKey={(r) => r.id}
        rows={resources}
        emptyMessage="No materials added yet — add some from an Event's Resources tab."
        columns={[
          {
            key: "title",
            label: "Resource Details",
            render: (r) => (
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500 border border-indigo-100 mt-0.5">
                  <FileText size={18} />
                </div>
                <div className="flex flex-col gap-1.5 overflow-hidden">
                  <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {r.title}
                  </p>
                  <a 
                    href={r.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-600 hover:underline truncate"
                  >
                    <LinkIcon size={12} className="shrink-0" />
                    <span className="truncate">{r.url}</span>
                  </a>
                </div>
              </div>
            ),
          },
          { 
            key: "event", 
            label: "Associated Event", 
            render: (r) => (
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-slate-500">
                  <BookOpen size={12} />
                </div>
                {r.event.title}
              </div>
            ) 
          },
          {
            key: "actions",
            label: "",
            render: (r) => (
              <div className="flex justify-end">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 gap-1.5 rounded-full px-4"
                  render={<Link href={`/instructor/events/${r.event.id}?tab=resources`}>Manage <ArrowRight size={14} /></Link>}
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
