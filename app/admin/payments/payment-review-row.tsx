"use client";

import { useActionState, useState } from "react";

import { approveManualPayment, rejectManualPayment } from "@/lib/payments/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ActionResult = { ok: true } | { ok: false; error: string };

export function PaymentReviewRow({ transactionId }: { transactionId: string }) {
  const [rejecting, setRejecting] = useState(false);
  const [approveState, approveAction, approvePending] = useActionState(
    async (): Promise<ActionResult> => approveManualPayment(transactionId),
    null,
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    rejectManualPayment.bind(null, transactionId),
    null,
  );

  if (approveState?.ok) {
    return <p className="text-sm text-muted-foreground">Approved.</p>;
  }
  if (rejectState?.ok) {
    return <p className="text-sm text-muted-foreground">Rejected.</p>;
  }

  if (rejecting) {
    return (
      <form action={rejectAction} className="flex flex-col gap-2">
        <Textarea
          name="reason"
          placeholder="Reason for rejection"
          rows={2}
          required
          minLength={5}
          className="w-64"
        />
        {rejectState?.ok === false && (
          <p className="text-sm text-destructive">{rejectState.error}</p>
        )}
        <div className="flex gap-2">
          <Button type="submit" size="sm" variant="destructive" disabled={rejectPending}>
            {rejectPending ? "Rejecting…" : "Confirm reject"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setRejecting(false)}
          >
            Back
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex gap-2">
      <form action={approveAction}>
        <Button type="submit" size="sm" disabled={approvePending}>
          {approvePending ? "Approving…" : "Approve"}
        </Button>
      </form>
      <Button
        type="button"
        size="sm"
        variant="destructive"
        onClick={() => setRejecting(true)}
      >
        Reject
      </Button>
    </div>
  );
}
