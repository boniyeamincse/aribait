import { notFound } from "next/navigation";
import Link from "next/link";

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

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <div>
        <Link
          href={`/events/${payment.registration.event.slug}`}
          className="text-sm text-muted-foreground underline underline-offset-4"
        >
          {payment.registration.event.title}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          {formatBdt(payment.amountBdt)}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            Status
            <Badge variant="secondary">{payment.status}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm">
          {(payment.status === "INITIATED" || payment.status === "PENDING") &&
            payment.registration.seatHold?.status === "HELD" && (
              <SeatHoldCountdown
                expiresAt={payment.registration.seatHold.expiresAt.toISOString()}
              />
            )}

          {(payment.status === "INITIATED" || payment.status === "FAILED") && (
            <>
              {payment.status === "FAILED" && latestTransaction?.reviewNote && (
                <p className="text-destructive">
                  Your last submission was rejected: {latestTransaction.reviewNote}
                </p>
              )}
              <div className="rounded-lg border p-4">
                <p className="font-medium">How to pay</p>
                <ol className="mt-2 list-decimal space-y-1 pl-4 text-muted-foreground">
                  <li>
                    Send <strong>{formatBdt(payment.amountBdt)}</strong> via bKash
                    or Nagad (Send Money) to{" "}
                    <strong>{receivingMsisdn}</strong>.
                  </li>
                  <li>Copy the Transaction ID (TrxID) from the confirmation SMS.</li>
                  <li>Submit it below so an admin can confirm your seat.</li>
                </ol>
              </div>
              <PaymentProofForm paymentId={payment.id} />
            </>
          )}

          {payment.status === "PENDING" && (
            <p className="text-muted-foreground">
              Your payment proof is under review. You&apos;ll be notified once
              it&apos;s confirmed.
            </p>
          )}

          {payment.status === "PAID" && (
            <div className="flex flex-col gap-2">
              <p>Payment confirmed — you&apos;re registered.</p>
              {latestTransaction && (
                <p className="text-muted-foreground">
                  {latestTransaction.method} · TrxID {latestTransaction.trxId} ·{" "}
                  {latestTransaction.reviewedAt?.toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              )}
              <a
                href={`/dashboard/payments/${payment.id}/invoice`}
                className="text-sm text-cyan-600 underline underline-offset-4"
              >
                Download invoice
              </a>
            </div>
          )}

          {payment.status === "CANCELLED" && (
            <p className="text-muted-foreground">
              This checkout was cancelled or the seat hold expired.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
