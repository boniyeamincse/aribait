import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { prisma } from "@/lib/db/client";
import { formatBdt } from "@/lib/utils";

import { PaymentReviewRow } from "./payment-review-row";

const TABS = [
  { label: "Pending", status: "PENDING" as const },
  { label: "Paid", status: "PAID" as const },
  { label: "Failed", status: "FAILED" as const },
  { label: "All", status: null },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  PAID: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  FAILED: "bg-red-500/15 text-red-400 border-red-500/30",
};

export default async function AdminPaymentsPage(props: PageProps<"/admin/payments">) {
  const searchParams = await props.searchParams;
  const statusParam = typeof searchParams.status === "string" ? searchParams.status : "PENDING";
  const activeTab = TABS.find((t) => t.status === statusParam) ?? TABS[0];

  const transactions = await prisma.paymentTransaction.findMany({
    where: activeTab.status ? { status: activeTab.status } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      payment: { include: { registration: { include: { user: true, event: true } } } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Payments" description="Manual bKash/Nagad submissions and their review status." />

      <div className="flex gap-2 border-b border-slate-800 pb-px">
        {TABS.map((tab) => {
          const isActive = tab.label === activeTab.label;
          return (
            <Link
              key={tab.label}
              href={tab.status ? `/admin/payments?status=${tab.status}` : "/admin/payments?status=ALL"}
              className={
                isActive
                  ? "rounded-t-lg border-b-2 border-cyan-400 px-4 py-2 text-sm font-medium text-white"
                  : "rounded-t-lg border-b-2 border-transparent px-4 py-2 text-sm text-slate-500 hover:text-slate-300"
              }
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <AdminTable
        rowKey={(tx) => tx.id}
        rows={transactions}
        emptyMessage={
          activeTab.status === "PENDING" ? "Nothing pending review." : "No transactions in this view."
        }
        columns={[
          {
            key: "student",
            label: "Student",
            render: (tx) => (
              <div>
                <p className="font-medium text-white">
                  {tx.payment.registration.user.name ?? tx.payment.registration.user.email}
                </p>
                <p className="text-xs text-slate-500">{tx.payment.registration.user.email}</p>
              </div>
            ),
          },
          {
            key: "event",
            label: "Event",
            render: (tx) => tx.payment.registration.event.title,
          },
          {
            key: "amount",
            label: "Amount",
            render: (tx) => formatBdt(tx.payment.amountBdt),
          },
          {
            key: "method",
            label: "Method",
            render: (tx) => (
              <div>
                <p>{tx.method}</p>
                <p className="text-xs text-slate-500">
                  Sender {tx.senderMsisdn} · TrxID {tx.trxId}
                </p>
              </div>
            ),
          },
          {
            key: "proof",
            label: "Proof",
            render: (tx) =>
              tx.proofImageUrl ? (
                <a href={tx.proofImageUrl} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tx.proofImageUrl}
                    alt="Payment proof"
                    className="h-12 w-12 rounded-md border border-slate-700 object-cover"
                  />
                </a>
              ) : (
                <span className="text-xs text-slate-600">—</span>
              ),
          },
          {
            key: "status",
            label: activeTab.status === "PENDING" ? "Actions" : "Status",
            render: (tx) =>
              tx.status === "PENDING" ? (
                <PaymentReviewRow transactionId={tx.id} />
              ) : (
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[tx.status] ?? "bg-slate-500/15 text-slate-400 border-slate-500/30"}`}
                >
                  {tx.status}
                </span>
              ),
          },
        ]}
      />
    </div>
  );
}
