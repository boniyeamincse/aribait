import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Wallet, CheckCircle2, TrendingUp } from "lucide-react";

import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/db/client";
import { computeInstructorBalances } from "@/lib/finance/balances";
import { formatBdtAmount } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";

import { RecordPaymentDialog } from "../record-payment-dialog";
import { ReversePaymentDialog } from "../reverse-payment-dialog";

const EARNING_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  AVAILABLE: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  CANCELLED: "bg-slate-500/15 text-slate-500 border-slate-500/30",
  REVERSED: "bg-slate-500/15 text-slate-500 border-slate-500/30",
};

export default async function AdminInstructorPaymentDetailPage(
  props: PageProps<"/admin/instructor-payments/[instructorId]">,
) {
  await requireAdmin();
  const { instructorId } = await props.params;

  const instructor = await prisma.instructor.findUnique({ where: { id: instructorId } });
  if (!instructor) notFound();

  const [balances, earnings, payments] = await Promise.all([
    computeInstructorBalances(instructorId),
    prisma.instructorEarning.findMany({
      where: { instructorId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { event: { select: { title: true } } },
    }),
    prisma.instructorPayment.findMany({
      where: { instructorId },
      orderBy: { createdAt: "desc" },
      include: { recordedBy: { select: { name: true, email: true } } },
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
      <Link
        href="/admin/instructor-payments"
        className="flex w-fit items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft size={14} /> Back to Instructor Payments
      </Link>

      <AdminPageHeader
        title={instructor.name}
        description="Earnings, balance, and manual payment history."
        actions={<RecordPaymentDialog instructorId={instructor.id} availableBalance={balances.availableBalance} />}
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
          emptyMessage="No payments recorded yet."
          columns={[
            {
              key: "date",
              label: "Date",
              render: (p) => p.paymentDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
            },
            { key: "amount", label: "Amount", render: (p) => formatBdtAmount(p.amountBdt) },
            { key: "method", label: "Method", render: (p) => p.method.replace(/_/g, " ") },
            { key: "reference", label: "Reference", render: (p) => p.referenceNumber },
            { key: "recordedBy", label: "Recorded By", render: (p) => p.recordedBy.name ?? p.recordedBy.email },
            {
              key: "status",
              label: "Status",
              render: (p) => (
                <div className="flex flex-col gap-1.5">
                  <span
                    className={`w-fit rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      p.status === "RECORDED"
                        ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-600"
                        : "border-slate-500/30 bg-slate-500/15 text-slate-500"
                    }`}
                  >
                    {p.status}
                  </span>
                  {p.status === "RECORDED" && <ReversePaymentDialog paymentId={p.id} />}
                </div>
              ),
            },
          ]}
        />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Recent Earnings</h2>
        <AdminTable
          rowKey={(e) => e.id}
          rows={earnings}
          emptyMessage="No earnings yet."
          columns={[
            {
              key: "date",
              label: "Date",
              render: (e) => e.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
            },
            { key: "event", label: "Event", render: (e) => e.event.title },
            { key: "gross", label: "Student Paid", render: (e) => formatBdtAmount(e.grossAmountBdt) },
            {
              key: "instructor",
              label: "Instructor Amount",
              render: (e) => `${formatBdtAmount(e.instructorAmountBdt)} (${e.instructorPct}%)`,
            },
            {
              key: "status",
              label: "Status",
              render: (e) => (
                <span className={`w-fit rounded-full border px-2.5 py-0.5 text-xs font-semibold ${EARNING_STATUS_COLORS[e.status]}`}>
                  {e.status}
                </span>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
