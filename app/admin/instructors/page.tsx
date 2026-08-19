import { Mail, Phone, Building2, Globe, Briefcase, Code2, MessageSquare } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { prisma } from "@/lib/db/client";

import { InstructorForm } from "./instructor-form";

export default async function AdminInstructorsPage() {
  const instructors = await prisma.instructor.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { events: true } } },
  });

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader 
        title="Instructors" 
        description="Manage instructor profiles, contact information, and social links." 
      />
      
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Add New Instructor</h2>
        <InstructorForm />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Instructor Directory</h2>
        <AdminTable
          rowKey={(i) => i.id}
          rows={instructors}
          emptyMessage="No instructors yet."
          columns={[
            {
              key: "name",
              label: "Name",
              render: (i) => (
                <div>
                  <p className="font-medium text-slate-900">{i.name}</p>
                  {i.title && <p className="text-xs text-slate-500">{i.title}</p>}
                </div>
              ),
            },
            {
              key: "contact",
              label: "Contact",
              render: (i) => (
                <div className="flex flex-col gap-1 text-xs text-slate-600">
                  {i.email && (
                    <span className="flex items-center gap-1.5 hover:text-blue-400">
                      <Mail size={12} /> {i.email}
                    </span>
                  )}
                  {i.phone && (
                    <span className="flex items-center gap-1.5 hover:text-blue-400">
                      <Phone size={12} /> {i.phone}
                    </span>
                  )}
                  {!i.email && !i.phone && <span>—</span>}
                </div>
              ),
            },
            {
              key: "company",
              label: "Company",
              render: (i) =>
                i.company ? (
                  <span className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Building2 size={12} /> {i.company}
                  </span>
                ) : (
                  <span className="text-xs text-slate-600">—</span>
                ),
            },
            {
              key: "socials",
              label: "Links",
              render: (i) => (
                <div className="flex items-center gap-2 text-slate-500">
                  {i.website && (
                    <a href={i.website} target="_blank" rel="noreferrer" className="hover:text-blue-400" title="Website">
                      <Globe size={14} />
                    </a>
                  )}
                  {i.linkedinUrl && (
                    <a href={i.linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-blue-400" title="LinkedIn">
                      <Briefcase size={14} />
                    </a>
                  )}
                  {i.githubUrl && (
                    <a href={i.githubUrl} target="_blank" rel="noreferrer" className="hover:text-blue-400" title="GitHub">
                      <Code2 size={14} />
                    </a>
                  )}
                  {i.twitterUrl && (
                    <a href={i.twitterUrl} target="_blank" rel="noreferrer" className="hover:text-blue-400" title="Twitter/X">
                      <MessageSquare size={14} />
                    </a>
                  )}
                  {!i.website && !i.linkedinUrl && !i.githubUrl && !i.twitterUrl && <span>—</span>}
                </div>
              ),
            },
            {
              key: "events",
              label: "Events",
              render: (i) => (
                <span className="text-slate-700">
                  {i._count.events} Event{i._count.events === 1 ? "" : "s"}
                </span>
              ),
            },
          ]}
        />
      </section>
    </div>
  );
}
