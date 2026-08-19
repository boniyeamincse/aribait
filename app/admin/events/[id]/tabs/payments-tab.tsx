import Link from "next/link";

import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { getEventPaymentTransactions } from "@/lib/admin/event-detail";
import { formatBdt } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  INITIATED: "bg-slate-500/15 text-slate-600 border-slate-500/30",
  PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  PAID: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  FAILED: "bg-red-500/15 text-red-400 border-red-500/30",
  CANCELLED: "bg-slate-500/15 text-slate-600 border-slate-500/30",
  REFUNDED: "bg-green-500/15 text-green-400 border-green-500/30",
  PARTIALLY_REFUNDED: "bg-green-500/15 text-green-400 border-green-500/30",
};

export async function PaymentsTab({ eventId }: { eventId: string }) {
  const transactions = await getEventPaymentTransactions(eventId);
  const hasPending = transactions.some((t) => t.status === "PENDING");

  return (
    <div className="flex flex-col gap-3">
      {hasPending && (
        <Link href="/admin/payments" className="self-start text-xs text-blue-400 hover:underline">
          Review pending payments →
        </Link>
      )}
      <AdminTable
        rowKey={(t) => t.id}
        rows={transactions}
        emptyMessage="No payment submissions for this Event yet."
        columns={[
          {
            key: "student",
            label: "Student",
            render: (t) => (
              <div>
                <p className="font-medium text-slate-900">
                  {t.payment.registration.user.name ?? t.payment.registration.user.email}
                </p>
                <p className="text-xs text-slate-500">{t.payment.registration.user.email}</p>
              </div>
            ),
          },
          { key: "amount", label: "Amount", render: (t) => formatBdt(t.payment.amountBdt) },
          {
            key: "method",
            label: "Method",
            render: (t) => (
              <div>
                <p>{t.method}</p>
                <p className="text-xs text-slate-500">TrxID {t.trxId}</p>
              </div>
            ),
          },
          { key: "status", label: "Status", render: (t) => <StatusBadge status={t.status} map={STATUS_COLORS} /> },
          {
            key: "when",
            label: "Submitted",
            render: (t) => t.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
          },
        ]}
      />
    </div>
  );
}
