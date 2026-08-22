import { Mail, Phone, Building2, Globe, Briefcase, Code2, MessageSquare } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { prisma } from "@/lib/db/client";
import { setInstructorVerification } from "@/lib/instructors/actions";

import { AddInstructorDialog } from "./add-instructor-dialog";

const VERIFICATION_COLORS: Record<string, string> = {
  UNVERIFIED: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  VERIFIED: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  REJECTED: "bg-red-500/15 text-red-600 border-red-500/30",
};

export default async function AdminInstructorsPage() {
  const instructors = await prisma.instructor.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { events: true } },
      user: { select: { status: true } },
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Instructors"
        description="Create instructor accounts (login + profile) and manage contact info and social links."
        actions={<AddInstructorDialog />}
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Instructor Directory{" "}
          <span className="text-sm font-normal text-slate-500">
            ({instructors.length})
          </span>
        </h2>
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
            {
              key: "account",
              label: "Account",
              render: (i) =>
                i.user ? (
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-600">
                    {i.user.status}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">No login</span>
                ),
            },
            {
              key: "verification",
              label: "Event Eligibility",
              render: (i) => (
                <div className="flex flex-col gap-1.5">
                  <span
                    className={`w-fit rounded-full border px-2.5 py-0.5 text-xs font-semibold ${VERIFICATION_COLORS[i.verificationStatus]}`}
                  >
                    {i.verificationStatus}
                  </span>
                  {i.user && i.verificationStatus !== "VERIFIED" && (
                    <form action={setInstructorVerification.bind(null, i.id, "VERIFIED")}>
                      <button
                        type="submit"
                        className="rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition-all hover:bg-emerald-100 active:scale-95"
                      >
                        ✓ Verify
                      </button>
                    </form>
                  )}
                  {i.user && i.verificationStatus === "VERIFIED" && (
                    <form action={setInstructorVerification.bind(null, i.id, "UNVERIFIED")}>
                      <button
                        type="submit"
                        className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 transition-all hover:bg-red-50 hover:border-red-300 hover:text-red-600 active:scale-95"
                      >
                        Revoke
                      </button>
                    </form>
                  )}
                  {!i.user && (
                    <span className="text-xs text-slate-400 italic">No login account</span>
                  )}
                </div>
              ),
            },
          ]}
        />
      </section>
    </div>
  );
}
