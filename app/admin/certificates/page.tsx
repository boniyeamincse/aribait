import { prisma } from "@/lib/db/client";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Award, CheckCircle, AlertCircle } from "lucide-react";

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

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Certificates"
        description="Manage and issue course completion certificates."
      />

      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-indigo-500" />
          <h2 className="text-lg font-semibold text-slate-900">Eligible for a certificate</h2>
        </div>
        
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          {eligibleRegistrations.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-sm text-slate-500">
              <CheckCircle className="mr-2 h-5 w-5 text-emerald-500" />
              No completed registrations awaiting a certificate.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {eligibleRegistrations.map((registration) => (
                <div
                  key={registration.id}
                  className="flex items-center justify-between gap-4 p-5 text-sm transition-colors hover:bg-slate-50/50"
                >
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-slate-900">{registration.user.name}</p>
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {registration.event.title}
                      </span>
                      {registration.required !== null && (
                        <span className="text-xs">
                          · attended {registration.attendedCount}/{registration.event._count.sessions}{" "}
                          Session{registration.event._count.sessions === 1 ? "" : "s"} (requires{" "}
                          {registration.required})
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    {registration.eligible ? (
                      <IssueCertificateButton registrationId={registration.id} />
                    ) : (
                      <Badge variant="destructive" className="bg-rose-50 text-rose-700 hover:bg-rose-100 border-none">
                        Attendance not met
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg font-semibold text-slate-900">Issued Certificates</h2>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          {certificates.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">
              No certificates issued yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {certificates.map((certificate) => (
                <div
                  key={certificate.id}
                  className="flex items-center justify-between gap-4 p-5 text-sm transition-colors hover:bg-slate-50/50"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 font-mono tracking-tight">
                        {certificate.certificateNumber}
                      </p>
                      {certificate.status === "REVOKED" && (
                        <Badge variant="destructive" className="bg-rose-50 text-rose-700 hover:bg-rose-100 border-none text-[10px] uppercase h-5">
                          Revoked
                        </Badge>
                      )}
                    </div>
                    <p className="text-slate-500">
                      <span className="font-semibold text-slate-700">{certificate.registration.user.name}</span>{" "}
                      · {certificate.registration.event.title}
                    </p>
                    {certificate.status === "REVOKED" && certificate.revokeReason && (
                      <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" />
                        Reason: {certificate.revokeReason}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {certificate.status === "ISSUED" ? (
                      <>
                        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none">
                          Active
                        </Badge>
                        <RevokeCertificateButton certificateId={certificate.id} />
                      </>
                    ) : (
                      <ReissueCertificateButton certificateId={certificate.id} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
