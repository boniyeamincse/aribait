"use client";

import { useActionState } from "react";

import { submitManualPaymentProof } from "@/lib/payments/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const METHOD_LABELS: Record<string, string> = {
  BKASH: "bKash",
  NAGAD: "Nagad",
};

export function PaymentProofForm({ paymentId }: { paymentId: string }) {
  const [state, formAction, pending] = useActionState(
    submitManualPaymentProof.bind(null, paymentId),
    null,
  );

  if (state?.ok) {
    return (
      <p className="text-sm">
        Submitted — an admin will review your payment shortly.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="method">Method</Label>
        <Select name="method" defaultValue="BKASH" required>
          <SelectTrigger id="method" className="w-full">
            <SelectValue>
              {(value: string | null) =>
                value ? METHOD_LABELS[value] : "Select method"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(METHOD_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="senderMsisdn">Your bKash/Nagad number</Label>
        <Input
          id="senderMsisdn"
          name="senderMsisdn"
          placeholder="01XXXXXXXXX"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="trxId">Transaction ID (TrxID)</Label>
        <Input id="trxId" name="trxId" required minLength={6} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="proofImageUrl">Screenshot URL (optional)</Label>
        <Input id="proofImageUrl" name="proofImageUrl" type="url" />
      </div>

      {state?.ok === false && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Submitting…" : "Submit payment proof"}
      </Button>
    </form>
  );
}
