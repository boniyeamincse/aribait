import Link from "next/link";
import { Mail, Phone, Building2, Globe, Briefcase, Code2, MessageSquare, Users, CheckCircle, ShieldCheck, ChevronRight } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { prisma } from "@/lib/db/client";
import { Button } from "@/components/ui/button";

import { AddInstructorDialog } from "./add-instructor-dialog";
import { VerificationCell, AccountStatusCell } from "./status-cells";

export default async function AdminInstructorsPage() {
  const instructors = await prisma.instructor.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { events: true } },
      user: { select: { status: true } },
    },
  });

  const total = instructors.length;
  const activeCount = instructors.filter((i) => i.user?.status === "ACTIVE").length;
  const verifiedCount = instructors.filter((i) => i.verificationStatus === "VERIFIED").length;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <AdminPageHeader
        title="Instructor Directory"
        description="Manage instructor profiles, platform access, contact information, and verification status."
        actions={<AddInstructorDialog />}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-1.5 bg-blue-500 opacity-90" />
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Total Instructors</p>
            <p className="text-2xl font-black text-slate-900">{total}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-1.5 bg-emerald-500 opacity-90" />
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Active Accounts</p>
            <p className="text-2xl font-black text-slate-900">{activeCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-1.5 bg-indigo-500 opacity-90" />
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Verified Instructors</p>
            <p className="text-2xl font-black text-slate-900">{verifiedCount}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-slate-900 px-1">Directory List</h2>
        
        <AdminTable
          rowKey={(i) => i.id}
          rows={instructors}
          emptyMessage="No instructors added to the platform yet."
          columns={[
            {
              key: "name",
              label: "Instructor Profile",
              render: (i) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white shadow-sm">
                    {i.name.charAt(0)}
                  </div>
                  <Link href={`/admin/instructors/${i.id}`} className="group flex flex-col">
                    <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{i.name}</span>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                      {i.title || "Instructor"}
                    </span>
                  </Link>
                </div>
              ),
            },
            {
              key: "contact",
              label: "Contact Info",
              render: (i) => (
                <div className="flex flex-col gap-1.5 text-[13px] font-medium text-slate-600">
                  {i.email && (
                    <a href={`mailto:${i.email}`} className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                      <Mail size={14} className="text-slate-400" /> {i.email}
                    </a>
                  )}
                  {i.phone && (
                    <a href={`tel:${i.phone}`} className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                      <Phone size={14} className="text-slate-400" /> {i.phone}
                    </a>
                  )}
                  {!i.email && !i.phone && <span className="italic text-slate-400">No contact info</span>}
                </div>
              ),
            },
            {
              key: "company",
              label: "Company / Links",
              render: (i) => (
                <div className="flex flex-col gap-2">
                  {i.company ? (
                    <span className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700">
                      <Building2 size={14} className="text-slate-400" /> {i.company}
                    </span>
                  ) : (
                    <span className="text-[13px] text-slate-400 italic">—</span>
                  )}
                  
                  <div className="flex items-center gap-3 text-slate-400">
                    {i.website && (
                      <a href={i.website} target="_blank" rel="noreferrer" className="hover:text-indigo-500 transition-colors" title="Website">
                        <Globe size={16} />
                      </a>
                    )}
                    {i.linkedinUrl && (
                      <a href={i.linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-blue-500 transition-colors" title="LinkedIn">
                        <Briefcase size={16} />
                      </a>
                    )}
                    {i.githubUrl && (
                      <a href={i.githubUrl} target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors" title="GitHub">
                        <Code2 size={16} />
                      </a>
                    )}
                    {i.twitterUrl && (
                      <a href={i.twitterUrl} target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors" title="Twitter/X">
                        <MessageSquare size={16} />
                      </a>
                    )}
                  </div>
                </div>
              ),
            },
            {
              key: "events",
              label: "Classes",
              render: (i) => (
                <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 border border-slate-200">
                  {i._count.events}
                </span>
              ),
            },
            {
              key: "account",
              label: "Account",
              render: (i) => <AccountStatusCell userId={i.userId} status={i.user?.status ?? null} />,
            },
            {
              key: "verification",
              label: "Verification",
              render: (i) => (
                <VerificationCell
                  instructorId={i.id}
                  verificationStatus={i.verificationStatus}
                  hasLogin={!!i.user}
                />
              ),
            },
            {
              key: "actions",
              label: "",
              render: (i) => (
                <Button
                  render={<Link href={`/admin/instructors/${i.id}`}>Manage</Link>}
                  nativeButton={false}
                  size="sm"
                  variant="outline"
                  className="bg-white hover:bg-slate-50 gap-1"
                >
                  Manage <ChevronRight size={14} className="opacity-70" />
                </Button>
              )
            }
          ]}
        />
      </div>
    </div>
  );
}
