import { prisma } from "@/lib/db/client";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { Award, CheckCircle, AlertCircle, ShieldAlert, FileBadge, CheckCircle2 } from "lucide-react";

import {
  IssueCertificateButton,
  ReissueCertificateButton,
  RevokeCertificateButton,
} from "./certificate-actions";

export default async function AdminCertificatesPage() {
  const [completedRegistrations, certificates] = await Promise.all([
    prisma.registration.findMany({
      where: { status: "COMPLETED", certificate: null },
      include: {
        user: true,
        event: { include: { _count: { select: { sessions: true } } } },
        attendances: { where: { status: { in: ["PRESENT", "LATE"] } } },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
    prisma.certificate.findMany({
      orderBy: { issuedAt: "desc" },
      take: 100,
      include: { registration: { include: { user: true, event: true } } },
    }),
  ]);

  const eligibleRegistrations = completedRegistrations.map((r) => {
    const attendedCount = r.attendances.length;
    const required = r.event.minAttendanceSessions;
    const eligible = required === null || attendedCount >= required;
    return { ...r, attendedCount, required, eligible };
  });

  const totalIssued = certificates.length;
  const activeCount = certificates.filter((c) => c.status === "ISSUED").length;
  const revokedCount = certificates.filter((c) => c.status === "REVOKED").length;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <AdminPageHeader
        title="Certificate Management"
        description="Issue, revoke, and manage course completion certificates for eligible students."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-1.5 bg-blue-500 opacity-90" />
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100">
            <FileBadge size={20} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Total Issued</p>
            <p className="text-2xl font-black text-slate-900">{totalIssued}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-1.5 bg-emerald-500 opacity-90" />
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Active Valid</p>
            <p className="text-2xl font-black text-slate-900">{activeCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-1.5 bg-rose-500 opacity-90" />
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-100">
            <ShieldAlert size={20} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Revoked / Void</p>
            <p className="text-2xl font-black text-slate-900">{revokedCount}</p>
          </div>
        </div>
      </div>

      {/* Eligible Students */}
      <section className="flex flex-col gap-4 mt-2">
        <div className="flex items-center gap-2 px-1">
          <Award className="h-5 w-5 text-indigo-500" />
          <h2 className="text-lg font-bold text-slate-900">Pending Issuance</h2>
        </div>
        
        <AdminTable
          rowKey={(r) => r.id}
          rows={eligibleRegistrations}
          emptyMessage="No completed registrations awaiting a certificate."
          columns={[
            {
              key: "student",
              label: "Student",
              render: (r) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 border border-slate-200">
                    {(r.user.name || r.user.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900">{r.user.name}</span>
                    <span className="text-xs text-slate-500">{r.user.email}</span>
                  </div>
                </div>
              ),
            },
            {
              key: "event",
              label: "Completed Event",
              render: (r) => (
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-slate-900 line-clamp-1">{r.event.title}</span>
                  {r.required !== null && (
                    <span className="text-[11px] font-medium text-slate-500">
                      Attendance: {r.attendedCount}/{r.event._count.sessions} (Req: {r.required})
                    </span>
                  )}
                </div>
              ),
            },
            {
              key: "status",
              label: "Eligibility",
              render: (r) => (
                r.eligible ? (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none shadow-none uppercase text-[10px] tracking-wide">
                    Eligible
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="bg-rose-50 text-rose-700 hover:bg-rose-100 border-none shadow-none uppercase text-[10px] tracking-wide">
                    Attendance Not Met
                  </Badge>
                )
              ),
            },
            {
              key: "action",
              label: "",
              render: (r) => (
                <div className="flex justify-end">
                  {r.eligible && <IssueCertificateButton registrationId={r.id} />}
                </div>
              ),
            }
          ]}
        />
      </section>

      {/* Issued Certificates */}
      <section className="flex flex-col gap-4 mt-4">
        <div className="flex items-center gap-2 px-1">
          <CheckCircle className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg font-bold text-slate-900">Issued Directory</h2>
        </div>
        
        <AdminTable
          rowKey={(c) => c.id}
          rows={certificates}
          emptyMessage="No certificates have been issued yet."
          columns={[
            {
              key: "cert_id",
              label: "Certificate ID",
              render: (c) => (
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-sm font-bold tracking-tight text-slate-900">
                    {c.certificateNumber}
                  </span>
                  <span className="text-xs text-slate-400">
                    Issued: {c.issuedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              ),
            },
            {
              key: "student",
              label: "Recipient & Course",
              render: (c) => (
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-slate-900">{c.registration.user.name}</span>
                  <span className="text-xs font-medium text-indigo-600 line-clamp-1">{c.registration.event.title}</span>
                </div>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (c) => (
                <div className="flex flex-col gap-1">
                  {c.status === "ISSUED" ? (
                    <Badge className="w-fit bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 uppercase text-[10px] tracking-wide shadow-none">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="w-fit bg-rose-50 text-rose-700 hover:bg-rose-100 border-none uppercase text-[10px] tracking-wide shadow-none">
                      Revoked
                    </Badge>
                  )}
                  {c.status === "REVOKED" && c.revokeReason && (
                    <span className="text-[10px] text-rose-600 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="h-3 w-3" />
                      {c.revokeReason}
                    </span>
                  )}
                </div>
              ),
            },
            {
              key: "action",
              label: "",
              render: (c) => (
                <div className="flex justify-end items-center gap-2">
                  {c.status === "ISSUED" ? (
                    <RevokeCertificateButton certificateId={c.id} />
                  ) : (
                    <ReissueCertificateButton certificateId={c.id} />
                  )}
                </div>
              ),
            }
          ]}
        />
      </section>
    </div>
  );
}
