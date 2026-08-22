import Link from "next/link";
import { CreditCard, Info, CalendarDays, Receipt, ChevronRight, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";

import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { formatBdt } from "@/lib/utils";

export default async function MyPaymentsPage() {
  const user = await requireUser();

  const payments = await prisma.payment.findMany({
    where: { registration: { userId: user.id } },
    orderBy: { createdAt: "desc" },
    include: { registration: { include: { event: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 shadow-inner">
          <CreditCard size={20} />
        </div>
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">
          Payments & Receipts
        </h1>
      </div>
      <div className="flex items-start gap-3 rounded-2xl bg-indigo-50/50 border border-indigo-100 p-4 backdrop-blur-sm">
        <Info size={20} className="text-indigo-500 shrink-0 mt-0.5" />
        <p className="text-sm text-indigo-900 leading-relaxed font-medium">
          View your payment history, track pending transactions, and download receipts for your enrolled courses.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {payments.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-white/50 backdrop-blur-md py-16 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 mb-5 shadow-inner">
              <CreditCard size={28} className="text-sky-400" />
            </div>
            <p className="text-lg font-bold text-slate-800">No payments yet</p>
            <p className="text-sm text-slate-500 mt-1 max-w-md">You haven&apos;t made any payments or registered for any paid courses.</p>
          </div>
        )}
        {payments.map((payment) => {
          let StatusIcon = Clock;
          let statusColor = "bg-slate-100 text-slate-600 border-slate-200";
          
          if (payment.status === "PAID") {
            StatusIcon = CheckCircle2;
            statusColor = "bg-emerald-50 text-emerald-600 border-emerald-200";
          } else if (payment.status === "FAILED" || payment.status === "CANCELLED") {
            StatusIcon = XCircle;
            statusColor = "bg-rose-50 text-rose-600 border-rose-200";
          } else if (payment.status === "PENDING" || payment.status === "INITIATED") {
            StatusIcon = Clock;
            statusColor = "bg-amber-50 text-amber-600 border-amber-200";
          } else if (payment.status === "REFUNDED" || payment.status === "PARTIALLY_REFUNDED") {
            StatusIcon = AlertCircle;
            statusColor = "bg-sky-50 text-sky-600 border-sky-200";
          }

          return (
            <Link
              key={payment.id}
              href={`/dashboard/payments/${payment.id}`}
              className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-[1.5rem] border border-white/60 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10 hover:bg-white/80"
            >
              <div className="flex gap-4 items-start">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 text-white shadow-md shadow-sky-500/20 group-hover:scale-110 transition-transform duration-300 mt-0.5">
                  <Receipt size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors pr-8 sm:pr-0">
                    {payment.registration.event.title}
                  </h3>
                  
                  <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1.5 bg-white/80 border border-slate-100 px-2.5 py-1.5 rounded-lg text-slate-700 shadow-sm backdrop-blur-sm">
                      <CreditCard size={14} className="text-emerald-500" />
                      {formatBdt(payment.amountBdt)}
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/80 border border-slate-100 px-2.5 py-1.5 rounded-lg text-slate-700 shadow-sm backdrop-blur-sm">
                      <CalendarDays size={14} className="text-sky-400" />
                      {payment.createdAt.toLocaleDateString("en-GB", { dateStyle: "medium" })}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-row items-center justify-between sm:justify-end gap-4 mt-2 sm:mt-0 border-t sm:border-t-0 border-slate-200/50 pt-4 sm:pt-0 w-full sm:w-auto">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold text-[11px] uppercase tracking-wider shadow-sm backdrop-blur-md ${statusColor}`}>
                  <StatusIcon size={14} />
                  {payment.status}
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 group-hover:bg-sky-100 group-hover:text-sky-600 transition-colors shrink-0">
                  <ChevronRight size={18} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
