import Link from "next/link";
import { Clock, Wallet, CheckCircle2 } from "lucide-react";

import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/db/client";
import { computePlatformFinanceOverview, listInstructorBalances } from "@/lib/finance/balances";
import { formatBdtAmount } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";

export default async function AdminInstructorPaymentsPage() {
  await requireAdmin();

  const [overview, balances, instructors] = await Promise.all([
    computePlatformFinanceOverview(),
    listInstructorBalances(),
    prisma.instructor.findMany({ orderBy: { name: "asc" } }),
  ]);

  const rows = instructors.map((instructor) => ({
    instructor,
    balances: balances.get(instructor.id) ?? {
      pendingEarnings: 0,
      availableEarnings: 0,
      totalPaid: 0,
      availableBalance: 0,
      lifetimeEarnings: 0,
    },
  }));

  const summaryCards = [
    { label: "Total Pending", value: overview.pendingEarnings, icon: Clock },
    { label: "Total Available", value: overview.availableBalance, icon: Wallet },
    { label: "Total Paid Out", value: overview.totalPaid, icon: CheckCircle2 },
  ];

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Instructor Payments"
        description="Earnings, balances, and manual payment history for every Instructor."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {summaryCards.map((card) => {
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
              <p className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                {formatBdtAmount(card.value)}
              </p>
            </div>
          );
        })}
      </div>

      <AdminTable
        rowKey={(r) => r.instructor.id}
        rows={rows}
        emptyMessage="No instructors yet."
        columns={[
          {
            key: "name",
            label: "Instructor",
            render: (r) => (
              <Link href={`/admin/instructor-payments/${r.instructor.id}`} className="font-medium text-slate-900 hover:underline">
                {r.instructor.name}
              </Link>
            ),
          },
          { key: "pending", label: "Pending", render: (r) => formatBdtAmount(r.balances.pendingEarnings) },
          {
            key: "available",
            label: "Available Balance",
            render: (r) => (
              <span className="font-semibold text-emerald-600">{formatBdtAmount(r.balances.availableBalance)}</span>
            ),
          },
          { key: "paid", label: "Total Paid", render: (r) => formatBdtAmount(r.balances.totalPaid) },
          { key: "lifetime", label: "Lifetime Earnings", render: (r) => formatBdtAmount(r.balances.lifetimeEarnings) },
        ]}
      />
    </div>
  );
}
