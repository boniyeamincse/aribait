import { Clock, Wallet, CheckCircle2, TrendingUp } from "lucide-react";

import { requireInstructor } from "@/lib/permissions";
import { prisma } from "@/lib/db/client";
import { computeInstructorBalances } from "@/lib/finance/balances";
import { formatBdtAmount } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";

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
    { label: "Pending Earnings", value: balances.pendingEarnings, icon: Clock },
    { label: "Available Balance", value: balances.availableBalance, icon: Wallet },
    { label: "Total Paid", value: balances.totalPaid, icon: CheckCircle2 },
    { label: "Lifetime Earnings", value: balances.lifetimeEarnings, icon: TrendingUp },
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Earnings"
        description="Your Session earnings and payment history. Admin pays you manually — this page only tracks the record."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {balanceCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-emerald-400 to-indigo-500 opacity-80" />
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  {card.label}
                </span>
                <Icon size={16} className="text-indigo-500/70" />
              </div>
              <p className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">{formatBdtAmount(card.value)}</p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Payment History</h2>
        <AdminTable
          rowKey={(p) => p.id}
          rows={payments}
          emptyMessage="No payments yet."
          columns={[
            {
              key: "date",
              label: "Date",
              render: (p) => p.paymentDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
            },
            { key: "amount", label: "Amount", render: (p) => formatBdtAmount(p.amountBdt) },
            { key: "method", label: "Method", render: (p) => p.method.replace(/_/g, " ") },
            { key: "reference", label: "Reference", render: (p) => p.referenceNumber },
            {
              key: "status",
              label: "Status",
              render: (p) => (
                <span
                  className={`w-fit rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    p.status === "RECORDED"
                      ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-600"
                      : "border-slate-500/30 bg-slate-500/15 text-slate-500"
                  }`}
                >
                  {p.status}
                </span>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
