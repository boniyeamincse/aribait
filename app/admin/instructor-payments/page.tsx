import Link from "next/link";
import { Clock, Wallet, CheckCircle2, TrendingUp, ChevronRight } from "lucide-react";

import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/db/client";
import { computePlatformFinanceOverview, listInstructorBalances } from "@/lib/finance/balances";
import { formatBdtAmount } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { Button } from "@/components/ui/button";

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
    { label: "Total Pending", value: overview.pendingEarnings, icon: Clock, color: "text-amber-600", bg: "bg-amber-100", gradient: "from-amber-400 to-amber-500" },
    { label: "Total Available", value: overview.availableBalance, icon: Wallet, color: "text-emerald-600", bg: "bg-emerald-100", gradient: "from-emerald-400 to-emerald-500" },
    { label: "Total Paid Out", value: overview.totalPaid, icon: CheckCircle2, color: "text-indigo-600", bg: "bg-indigo-100", gradient: "from-indigo-400 to-indigo-500" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Instructor Payments"
        description="Track earnings, available balances, and manage payouts for all platform instructors."
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r ${card.gradient} opacity-90`} />
              <div className="mb-4 flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${card.bg}`}>
                  <Icon size={18} className={card.color} />
                </div>
                <TrendingUp size={16} className="text-slate-300" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  {card.label}
                </span>
                <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {formatBdtAmount(card.value)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-slate-900">Instructor Balances</h2>
        <AdminTable
          rowKey={(r) => r.instructor.id}
          rows={rows}
          emptyMessage="No instructors found."
          columns={[
            {
              key: "name",
              label: "Instructor",
              render: (r) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold uppercase text-indigo-700 shadow-sm border border-indigo-200">
                    {r.instructor.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{r.instructor.name}</span>
                    <span className="text-xs font-medium text-slate-500">ID: {r.instructor.id.slice(-6).toUpperCase()}</span>
                  </div>
                </div>
              ),
            },
            {
              key: "finances",
              label: "Current Status",
              render: (r) => (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-20 text-xs font-semibold uppercase tracking-wider text-slate-500">Available</span>
                    <span className="font-bold text-emerald-600">{formatBdtAmount(r.balances.availableBalance)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20 text-xs font-semibold uppercase tracking-wider text-slate-500">Pending</span>
                    <span className="font-medium text-amber-600">{formatBdtAmount(r.balances.pendingEarnings)}</span>
                  </div>
                </div>
              ),
            },
            {
              key: "lifetime",
              label: "Lifetime Activity",
              render: (r) => (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-20 text-xs font-semibold uppercase tracking-wider text-slate-500">Total Paid</span>
                    <span className="font-medium text-slate-900">{formatBdtAmount(r.balances.totalPaid)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20 text-xs font-semibold uppercase tracking-wider text-slate-500">Earnings</span>
                    <span className="font-medium text-slate-600">{formatBdtAmount(r.balances.lifetimeEarnings)}</span>
                  </div>
                </div>
              ),
            },
            {
              key: "action",
              label: "Action",
              render: (r) => (
                <Button
                  render={<Link href={`/admin/instructor-payments/${r.instructor.id}`}>Manage Payouts</Link>}
                  nativeButton={false}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm gap-1 pl-3 pr-2"
                >
                  Manage <ChevronRight size={14} className="opacity-70" />
                </Button>
              ),
            }
          ]}
        />
      </div>
    </div>
  );
}
