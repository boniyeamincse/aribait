import Link from "next/link";
import { Clock, CheckCircle, XCircle, List, Search, Smartphone, Hash } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { prisma } from "@/lib/db/client";
import { formatBdt } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { PaymentReviewRow } from "./payment-review-row";

const TABS = [
  { id: "PENDING", label: "Pending Review", status: "PENDING" as const, icon: Clock },
  { id: "PAID", label: "Verified Paid", status: "PAID" as const, icon: CheckCircle },
  { id: "FAILED", label: "Failed/Rejected", status: "FAILED" as const, icon: XCircle },
  { id: "ALL", label: "All Transactions", status: null, icon: List },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  PAID: "bg-emerald-100 text-emerald-700 border-emerald-200",
  FAILED: "bg-red-100 text-red-700 border-red-200",
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
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <AdminPageHeader 
        title="Payment Verification" 
        description="Review and verify manual bKash and Nagad payment submissions." 
      />

      {/* Premium Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-slate-200 scrollbar-hide">
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
              className={`
                flex shrink-0 items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors
                ${isActive 
                  ? "border-indigo-600 text-indigo-700 bg-indigo-50/50" 
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"}
              `}
            >
              <Icon size={16} className={isActive ? "text-indigo-600" : "text-slate-400"} strokeWidth={isActive ? 2.5 : 2} />
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Modern Filter Section */}
      <form className="flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <input type="hidden" name="status" value={activeTab.status ?? "ALL"} />
        <div className="relative w-full sm:max-w-md shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by student name, number, or TrxID..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>
        <Button
          type="submit"
          className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm"
        >
          Search Transactions
        </Button>
      </form>

      {/* Premium Table */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-slate-900 px-1">{activeTab.label} List</h2>
        <AdminTable
          rowKey={(tx) => tx.id}
          rows={transactions}
          emptyMessage={
            query
              ? "No transactions match this search."
              : activeTab.status === "PENDING"
                ? "All caught up! Nothing pending review."
                : "No transactions in this view."
          }
          columns={[
            {
              key: "student",
              label: "Student Info",
              render: (tx) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 border border-slate-200">
                    {(tx.payment.registration.user.name || tx.payment.registration.user.email).charAt(0).toUpperCase()}
                  </div>
                  <Link href={`/admin/students/${tx.payment.registration.user.id}`} className="group flex flex-col">
                    <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {tx.payment.registration.user.name ?? "Unknown"}
                    </span>
                    <span className="text-xs text-slate-500">{tx.payment.registration.user.email}</span>
                  </Link>
                </div>
              ),
            },
            {
              key: "event",
              label: "For Event",
              render: (tx) => (
                <span className="font-medium text-slate-700 line-clamp-1">{tx.payment.registration.event.title}</span>
              ),
            },
            {
              key: "amount",
              label: "Paid Amount",
              render: (tx) => (
                <span className="font-bold text-slate-900 text-[15px]">{formatBdt(tx.payment.amountBdt)}</span>
              ),
            },
            {
              key: "method",
              label: "Transaction Details",
              render: (tx) => (
                <div className="flex flex-col gap-1.5">
                  <span className="inline-flex w-fit items-center rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-600 border border-slate-200">
                    {tx.method}
                  </span>
                  <div className="flex flex-col gap-0.5 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1.5"><Smartphone size={12} className="text-slate-400" /> {tx.senderMsisdn}</span>
                    <span className="flex items-center gap-1.5"><Hash size={12} className="text-slate-400" /> {tx.trxId}</span>
                  </div>
                </div>
              ),
            },
            {
              key: "proof",
              label: "Screenshot",
              render: (tx) =>
                tx.proofImageUrl ? (
                  <a href={tx.proofImageUrl} target="_blank" rel="noreferrer" className="group block h-14 w-14 overflow-hidden rounded-lg border border-slate-200 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={tx.proofImageUrl}
                      alt="Payment proof"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </a>
                ) : (
                  <span className="text-xs italic text-slate-400">No image</span>
                ),
            },
            {
              key: "status",
              label: activeTab.status === "PENDING" ? "Review Action" : "Status",
              render: (tx) =>
                tx.status === "PENDING" ? (
                  <PaymentReviewRow transactionId={tx.id} />
                ) : (
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase ${STATUS_COLORS[tx.status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}
                  >
                    {tx.status}
                  </span>
                ),
            },
          ]}
        />
      </div>
    </div>
  );
}
