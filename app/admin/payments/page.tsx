import { prisma } from "@/lib/db/client";
import { formatBdt } from "@/lib/utils";

import { PaymentReviewRow } from "./payment-review-row";

export default async function AdminPaymentsPage() {
  const transactions = await prisma.paymentTransaction.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      payment: { include: { registration: { include: { user: true, event: true } } } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
      <p className="text-sm text-muted-foreground">
        Manual bKash/Nagad submissions awaiting review.
      </p>

      <div className="divide-y rounded-lg border">
        {transactions.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">
            Nothing pending review.
          </p>
        )}
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between gap-4 p-4 text-sm"
          >
            <div>
              <p className="font-medium">
                {tx.payment.registration.event.title}
              </p>
              <p className="text-muted-foreground">
                {tx.payment.registration.user.name} (
                {tx.payment.registration.user.email}) ·{" "}
                {formatBdt(tx.payment.amountBdt)} · {tx.method} · Sender{" "}
                {tx.senderMsisdn} · TrxID {tx.trxId}
              </p>
              {tx.proofImageUrl && (
                <a
                  href={tx.proofImageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs underline underline-offset-4"
                >
                  View proof
                </a>
              )}
            </div>
            <PaymentReviewRow transactionId={tx.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
