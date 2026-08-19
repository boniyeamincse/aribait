"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { startPaidCheckout } from "@/lib/registrations/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PayButton({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [couponCode, setCouponCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          placeholder="Coupon code (optional)"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          className="w-44"
        />
        <Button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              const result = await startPaidCheckout(
                eventId,
                couponCode || undefined,
              );
              if (result.ok) {
                router.push(`/dashboard/payments/${result.paymentId}`);
              } else {
                setError(result.error);
              }
            })
          }
        >
          {pending ? "Starting checkout…" : "Register & Pay"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
