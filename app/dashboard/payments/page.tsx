import Link from "next/link";

import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { formatBdt } from "@/lib/utils";

export default async function MyPaymentsPage() {
  const user = await requireUser();

  const payments = await prisma.payment.findMany({
    where: { registration: { userId: user.id } },
    orderBy: { createdAt: "desc" },
    include: { registration: { include: { event: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Payments and Receipts
      </h1>
      <div className="mt-6 divide-y rounded-lg border">
        {payments.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">
            No payments yet.
          </p>
        )}
        {payments.map((payment) => (
          <Link
            key={payment.id}
            href={`/dashboard/payments/${payment.id}`}
            className="flex items-center justify-between gap-4 p-4 text-sm hover:bg-accent"
          >
            <div>
              <p className="font-medium">{payment.registration.event.title}</p>
              <p className="text-muted-foreground">
                {formatBdt(payment.amountBdt)} ·{" "}
                {payment.createdAt.toLocaleDateString("en-GB", {
                  dateStyle: "medium",
                })}
              </p>
            </div>
            <Badge variant="secondary">{payment.status}</Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
