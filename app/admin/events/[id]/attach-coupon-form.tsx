"use client";

import { useActionState } from "react";

import { attachDiscountToEvent } from "@/lib/discounts/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AttachCouponForm({ eventId }: { eventId: string }) {
  const [state, formAction, pending] = useActionState(
    attachDiscountToEvent.bind(null, eventId),
    null,
  );

  return (
    <form action={formAction} className="flex items-end gap-3">
      <div className="flex flex-col gap-2">
        <label htmlFor="code" className="text-xs text-muted-foreground">
          Coupon code
        </label>
        <Input id="code" name="code" required className="w-40" />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Attaching…" : "Attach"}
      </Button>
      {state?.ok === false && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
    </form>
  );
}
