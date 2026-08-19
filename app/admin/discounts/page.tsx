import { prisma } from "@/lib/db/client";
import { deactivateCoupon } from "@/lib/discounts/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBdt } from "@/lib/utils";

import { DiscountForm } from "./discount-form";

export default async function AdminDiscountsPage() {
  const discounts = await prisma.discount.findMany({
    orderBy: { createdAt: "desc" },
    include: { events: { include: { event: true } }, _count: { select: { redemptions: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Discounts and Coupons</h1>
      <DiscountForm />

      <div className="divide-y rounded-lg border">
        {discounts.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">No coupons yet.</p>
        )}
        {discounts.map((discount) => (
          <div
            key={discount.id}
            className="flex items-center justify-between gap-4 p-4 text-sm"
          >
            <div>
              <p className="font-medium">{discount.code}</p>
              <p className="text-muted-foreground">
                {discount.type === "PERCENTAGE"
                  ? `${discount.amount}% off`
                  : `${formatBdt(discount.amount)} off`}{" "}
                · {discount._count.redemptions} used ·{" "}
                {discount.events.length === 0
                  ? "sitewide"
                  : discount.events.map((e) => e.event.title).join(", ")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={discount.active ? "secondary" : "outline"}>
                {discount.active ? "Active" : "Inactive"}
              </Badge>
              {discount.active && (
                <form action={deactivateCoupon.bind(null, discount.id)}>
                  <Button type="submit" size="sm" variant="outline">
                    Deactivate
                  </Button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
