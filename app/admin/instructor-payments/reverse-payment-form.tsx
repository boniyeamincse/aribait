"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { reverseInstructorPayment } from "@/lib/finance/payment-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ReversePaymentForm({ paymentId, onSuccess }: { paymentId: string; onSuccess?: () => void }) {
  const reverseWithId = reverseInstructorPayment.bind(null, paymentId);
  const [state, formAction, pending] = useActionState(reverseWithId, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      toast.success("Payment reversed.");
      formRef.current?.reset();
      onSuccess?.();
    }
  }, [state, onSuccess]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reason">Reason</Label>
        <Textarea id="reason" name="reason" rows={3} required minLength={5} maxLength={500} />
      </div>
      {state?.ok === false && <p className="text-xs text-destructive">{state.error}</p>}
      <Button type="submit" variant="destructive" disabled={pending} className="self-start">
        {pending ? "Reversing…" : "Reverse Payment"}
      </Button>
    </form>
  );
}
