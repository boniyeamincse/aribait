import { notFound } from "next/navigation";
import Link from "next/link";
import { Receipt, Download, Info, CheckCircle2, AlertCircle, Clock, XCircle, ChevronLeft } from "lucide-react";

import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBdt } from "@/lib/utils";

import { PaymentProofForm } from "./payment-proof-form";
import { SeatHoldCountdown } from "./seat-hold-countdown";

export default async function PaymentDetailPage({
  params,
}: PageProps<"/dashboard/payments/[id]">) {
  const { id } = await params;
  const user = await requireUser();

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      registration: { include: { event: true, seatHold: true } },
      transactions: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!payment || payment.registration.userId !== user.id) notFound();

  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  const receivingMsisdn = settings?.bkashNagadReceivingMsisdn ?? "01914638653";
  const latestTransaction = payment.transactions[0];

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
    <div className="flex max-w-2xl flex-col gap-6 mx-auto w-full pt-4">
      <div>
        <Link
          href="/dashboard/payments"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-sky-600 transition-colors mb-4"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to Payments
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">
              {formatBdt(payment.amountBdt)}
            </h1>
            <Link
              href={`/events/${payment.registration.event.slug}`}
              className="inline-flex mt-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 underline underline-offset-4"
            >
              {payment.registration.event.title}
            </Link>
          </div>
          <div className={`flex items-center self-start gap-2 px-4 py-2 rounded-xl border font-bold text-xs uppercase tracking-wider shadow-sm backdrop-blur-md ${statusColor}`}>
            <StatusIcon size={16} />
            {payment.status}
          </div>
        </div>
      </div>

      <div className="relative flex flex-col gap-5 rounded-[1.5rem] border border-white/60 bg-white/60 p-6 sm:p-8 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col gap-6 text-sm">
          {(payment.status === "INITIATED" || payment.status === "PENDING") &&
            payment.registration.seatHold?.status === "HELD" && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 backdrop-blur-sm">
                <SeatHoldCountdown
                  expiresAt={payment.registration.seatHold.expiresAt.toISOString()}
                />
              </div>
            )}

          {(payment.status === "INITIATED" || payment.status === "FAILED") && (
            <>
              {payment.status === "FAILED" && latestTransaction?.reviewNote && (
                <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/50 p-4 text-rose-700 backdrop-blur-sm">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <p>
                    <strong>Submission Rejected:</strong> {latestTransaction.reviewNote}
                  </p>
                </div>
              )}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2 font-bold text-indigo-900 mb-3">
                  <Info size={18} className="text-indigo-500" />
                  How to pay
                </div>
                <ol className="list-decimal space-y-2.5 pl-5 text-indigo-800/80 font-medium">
                  <li>
                    Send <strong className="text-indigo-900">{formatBdt(payment.amountBdt)}</strong> via bKash
                    or Nagad (Send Money) to{" "}
                    <strong className="text-indigo-900">{receivingMsisdn}</strong>.
                  </li>
                  <li>Copy the Transaction ID (TrxID) from the confirmation SMS.</li>
                  <li>Submit it below so an admin can confirm your seat.</li>
                </ol>
              </div>
              <div className="mt-2">
                <PaymentProofForm paymentId={payment.id} />
              </div>
            </>
          )}

          {payment.status === "PENDING" && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-amber-200 bg-amber-50/50 p-8 text-center backdrop-blur-sm">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 mb-4 animate-pulse">
                <Clock size={32} />
              </div>
              <p className="text-lg font-bold text-amber-900">Payment under review</p>
              <p className="text-sm text-amber-700/80 mt-1 max-w-xs">
                Your payment proof has been submitted. You&apos;ll be notified once an admin confirms it.
              </p>
            </div>
          )}

          {payment.status === "PAID" && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50/50 p-8 text-center backdrop-blur-sm">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
                <CheckCircle2 size={32} />
              </div>
              <p className="text-lg font-bold text-emerald-900">Payment Confirmed</p>
              <p className="text-sm text-emerald-700/80 mt-1 max-w-sm mb-6">
                Your payment was successfully verified and your seat is confirmed.
              </p>
              
              {latestTransaction && (
                <div className="flex flex-col gap-2 w-full max-w-sm bg-white/60 p-4 rounded-lg border border-emerald-100 text-left mb-6">
                  <div className="flex justify-between border-b border-emerald-100/50 pb-2">
                    <span className="text-emerald-700/70">Method</span>
                    <span className="font-semibold text-emerald-900">{latestTransaction.method}</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-100/50 pb-2">
                    <span className="text-emerald-700/70">Transaction ID</span>
                    <span className="font-semibold text-emerald-900">{latestTransaction.trxId}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-emerald-700/70">Verified</span>
                    <span className="font-semibold text-emerald-900">
                      {latestTransaction.reviewedAt?.toLocaleDateString("en-GB", { dateStyle: "medium" })}
                    </span>
                  </div>
                </div>
              )}
              
              <a
                href={`/dashboard/payments/${payment.id}/invoice`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 hover:bg-emerald-700"
              >
                <Download size={18} />
                Download Invoice
              </a>
            </div>
          )}

          {payment.status === "CANCELLED" && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50/50 p-8 text-center backdrop-blur-sm">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
                <XCircle size={32} />
              </div>
              <p className="text-lg font-bold text-rose-900">Payment Cancelled</p>
              <p className="text-sm text-rose-700/80 mt-1 max-w-xs">
                This checkout was cancelled or your seat hold expired.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
