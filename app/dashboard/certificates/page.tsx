import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Info, Download, CalendarDays, Hash, CheckCircle2, XCircle } from "lucide-react";

export default async function MyCertificatesPage() {
  const user = await requireUser();

  const certificates = await prisma.certificate.findMany({
    where: { registration: { userId: user.id } },
    orderBy: { issuedAt: "desc" },
    include: { registration: { include: { event: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 shadow-inner">
          <Award size={20} />
        </div>
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">
          Certificates
        </h1>
      </div>
      <div className="flex items-start gap-3 rounded-2xl bg-indigo-50/50 border border-indigo-100 p-4 backdrop-blur-sm">
        <Info size={20} className="text-indigo-500 shrink-0 mt-0.5" />
        <p className="text-sm text-indigo-900 leading-relaxed font-medium">
          View and download your earned certificates. Certificates appear here automatically once you successfully complete an eligible course and an admin issues them.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {certificates.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-white/50 backdrop-blur-md py-16 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 mb-5 shadow-inner">
              <Award size={28} className="text-amber-500" />
            </div>
            <p className="text-lg font-bold text-slate-800">No certificates yet</p>
            <p className="text-sm text-slate-500 mt-1 max-w-md">Complete a course successfully to earn your first certificate. They will appear here once issued by an admin.</p>
          </div>
        )}
        {certificates.map((certificate) => {
          const isIssued = certificate.status === "ISSUED";
          
          return (
            <div
              key={certificate.id}
              className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-[1.5rem] border border-white/60 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 hover:bg-white/80"
            >
              <div className="flex gap-4 items-start">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform duration-300 mt-0.5">
                  <Award size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                    {certificate.registration.event.title}
                  </h3>
                  
                  <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1.5 bg-white/80 border border-slate-100 px-2.5 py-1.5 rounded-lg text-slate-700 shadow-sm backdrop-blur-sm">
                      <Hash size={14} className="text-slate-400" />
                      {certificate.certificateNumber}
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/80 border border-slate-100 px-2.5 py-1.5 rounded-lg text-slate-700 shadow-sm backdrop-blur-sm">
                      <CalendarDays size={14} className="text-indigo-400" />
                      Issued on {certificate.issuedAt.toLocaleDateString("en-GB", { dateStyle: "medium" })}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:items-end gap-3 self-start sm:self-center mt-2 sm:mt-0 border-t sm:border-t-0 border-slate-200/50 pt-4 sm:pt-0 w-full sm:w-auto">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold text-[11px] uppercase tracking-wider shadow-sm backdrop-blur-md self-start sm:self-auto ${
                  isIssued ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-rose-50 text-rose-600 border-rose-200"
                }`}>
                  {isIssued ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  {certificate.status}
                </div>
                {isIssued && (
                  <a
                    href={`/dashboard/certificates/${certificate.id}/download`}
                    className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-amber-500 text-amber-600 bg-amber-50 px-5 py-2 text-sm font-bold shadow-sm transition-all hover:bg-amber-500 hover:text-white hover:scale-105 w-full sm:w-auto"
                  >
                    <Download size={16} />
                    Download
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
