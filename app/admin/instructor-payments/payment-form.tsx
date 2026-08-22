"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { recordInstructorPayment } from "@/lib/finance/payment-actions";
import { INSTRUCTOR_PAYOUT_METHODS } from "@/lib/validations/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function PaymentForm({
  instructorId,
  availableBalance,
  onSuccess,
}: {
  instructorId: string;
  availableBalance: number;
  onSuccess?: () => void;
}) {
  const recordWithId = recordInstructorPayment.bind(null, instructorId);
  const [state, formAction, pending] = useActionState(recordWithId, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      toast.success("Payment recorded.");
      formRef.current?.reset();
      onSuccess?.();
    }
  }, [state, onSuccess]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="amountBdt">Amount (BDT)</Label>
          <Input
            id="amountBdt"
            name="amountBdt"
            type="number"
            min={1}
            max={availableBalance}
            required
            placeholder={`Up to ${availableBalance}`}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="paymentDate">Payment Date</Label>
          <Input id="paymentDate" name="paymentDate" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="method">Payment Method</Label>
          <select
            id="method"
            name="method"
            required
            defaultValue="BKASH"
            className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {INSTRUCTOR_PAYOUT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="referenceNumber">Transaction / Reference No.</Label>
          <Input id="referenceNumber" name="referenceNumber" required maxLength={100} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="note">Note</Label>
        <Textarea id="note" name="note" rows={2} placeholder="Optional" />
      </div>

      {state?.ok === false && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending || availableBalance <= 0} className="self-start">
        {pending ? "Recording…" : "Record Payment"}
      </Button>
      {availableBalance <= 0 && (
        <p className="text-xs text-slate-500">No available balance to pay out.</p>
      )}
    </form>
  );
}
