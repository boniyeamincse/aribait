import { Clock, Wallet, CheckCircle2, TrendingUp, Calendar, Receipt, CreditCard, Hash } from "lucide-react";

import { requireInstructor } from "@/lib/permissions";
import { prisma } from "@/lib/db/client";
import { computeInstructorBalances } from "@/lib/finance/balances";
import { formatBdtAmount } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { Badge } from "@/components/ui/badge";

export default async function InstructorEarningsPage() {
  const { instructor } = await requireInstructor();

  const [balances, payments] = await Promise.all([
    computeInstructorBalances(instructor.id),
    prisma.instructorPayment.findMany({
      where: { instructorId: instructor.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const balanceCards = [
    { label: "Pending Earnings", value: balances.pendingEarnings, icon: Clock, color: "amber" },
    { label: "Available Balance", value: balances.availableBalance, icon: Wallet, color: "blue" },
    { label: "Total Paid", value: balances.totalPaid, icon: CheckCircle2, color: "emerald" },
    { label: "Lifetime Earnings", value: balances.lifetimeEarnings, icon: TrendingUp, color: "indigo" },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      <AdminPageHeader
        title="Financial Overview"
        description="Track your session earnings, available balances, and historical payments."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-4">
        {balanceCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
            >
              <div className={`absolute left-0 top-0 h-1 w-full bg-${card.color}-500 opacity-80 group-hover:opacity-100 transition-opacity`} />
              <div className="mb-3 flex items-center justify-between">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-${card.color}-50 text-${card.color}-600 border border-${card.color}-100`}>
                  <Icon size={18} />
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{formatBdtAmount(card.value)}</p>
                <span className="mt-1 block text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-indigo-600 transition-colors">
                  {card.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 mt-2">
        <h2 className="text-xl font-black text-slate-900 tracking-tight px-1">Payment History</h2>
        <AdminTable
          rowKey={(p) => p.id}
          rows={payments}
          emptyMessage="No payments recorded yet."
          columns={[
            {
              key: "date",
              label: "Date",
              render: (p) => (
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Calendar size={14} className="text-slate-400" />
                  {p.paymentDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              ),
            },
            { 
              key: "amount", 
              label: "Amount", 
              render: (p) => (
                <div className="flex items-center gap-2 font-black text-slate-900">
                  <Receipt size={14} className="text-emerald-500" />
                  {formatBdtAmount(p.amountBdt)}
                </div>
              ) 
            },
            { 
              key: "method", 
              label: "Method", 
              render: (p) => (
                <div className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-widest text-[11px]">
                  <CreditCard size={14} className="text-slate-400" />
                  {p.method.replace(/_/g, " ")}
                </div>
              ) 
            },
            { 
              key: "reference", 
              label: "TrxID / Reference", 
              render: (p) => (
                <div className="flex items-center gap-1.5 font-mono text-sm text-slate-600">
                  <Hash size={12} className="text-slate-400" />
                  {p.referenceNumber || <span className="italic text-slate-400">N/A</span>}
                </div>
              ) 
            },
            {
              key: "status",
              label: "Status",
              render: (p) => (
                <Badge className={`uppercase text-[10px] tracking-wide px-2.5 shadow-none ${
                  p.status === "RECORDED"
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200"
                }`}>
                  {p.status}
                </Badge>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
