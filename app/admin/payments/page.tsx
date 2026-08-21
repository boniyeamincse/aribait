import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { prisma } from "@/lib/db/client";
import { formatBdt } from "@/lib/utils";

import { PaymentReviewRow } from "./payment-review-row";

import { Clock, CheckCircle, XCircle, List } from "lucide-react";

const TABS = [
  { id: "PENDING", label: "Pending", status: "PENDING" as const, icon: Clock },
  { id: "PAID", label: "Paid", status: "PAID" as const, icon: CheckCircle },
  { id: "FAILED", label: "Failed", status: "FAILED" as const, icon: XCircle },
  { id: "ALL", label: "All", status: null, icon: List },
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
  const query = typeof searchParams.q === "string" ? searchParams.q : "";

  const transactions = await prisma.paymentTransaction.findMany({
    where: {
      ...(activeTab.status ? { status: activeTab.status } : {}),
      ...(query
        ? {
            OR: [
              { senderMsisdn: { contains: query, mode: "insensitive" } },
              { trxId: { contains: query, mode: "insensitive" } },
              { payment: { registration: { user: { name: { contains: query, mode: "insensitive" } } } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      payment: { include: { registration: { include: { user: true, event: true } } } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Payments" description="Manual bKash/Nagad submissions and their review status." />

      <div className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-px scrollbar-hide">
        {TABS.map((tab) => {
          const isActive = tab.label === activeTab.label;
          const Icon = tab.icon;
          const tabStatus = tab.status ?? "ALL";
          const href = query
            ? `/admin/payments?status=${tabStatus}&q=${encodeURIComponent(query)}`
            : `/admin/payments?status=${tabStatus}`;
          return (
            <Link
              key={tab.label}
              href={href}
              className={
                isActive
                  ? "flex shrink-0 items-center gap-2 rounded-t-lg border-b-2 border-blue-400 px-4 py-2.5 text-sm font-medium text-slate-900 bg-slate-100/20"
                  : "flex shrink-0 items-center gap-2 rounded-t-lg border-b-2 border-transparent px-4 py-2.5 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100/10 transition-colors"
              }
            >
              <Icon size={16} className={isActive ? "text-blue-400" : "text-slate-500"} strokeWidth={isActive ? 2 : 1.75} />
              {tab.label}
            </Link>
          );
        })}
      </div>

      <form className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <input type="hidden" name="status" value={activeTab.status ?? "ALL"} />
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search by name, number, or TrxID…"
          className="min-w-48 flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-gradient-to-r from-blue-500 to-green-600 px-4 py-2 text-sm font-semibold text-slate-900 hover:from-blue-400 hover:to-green-500"
        >
          Search
        </button>
      </form>

      <AdminTable
        rowKey={(tx) => tx.id}
        rows={transactions}
        emptyMessage={
          query
            ? "No transactions match this search."
            : activeTab.status === "PENDING"
              ? "Nothing pending review."
              : "No transactions in this view."
        }
        columns={[
          {
            key: "student",
            label: "Student",
            render: (tx) => (
              <Link href={`/admin/students/${tx.payment.registration.user.id}`} className="block hover:underline">
                <p className="font-medium text-slate-900">
                  {tx.payment.registration.user.name ?? tx.payment.registration.user.email}
                </p>
                <p className="text-xs text-slate-500">{tx.payment.registration.user.email}</p>
              </Link>
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
                    className="h-12 w-12 rounded-md border border-slate-300 object-cover"
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
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[tx.status] ?? "bg-slate-500/15 text-slate-600 border-slate-500/30"}`}
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
