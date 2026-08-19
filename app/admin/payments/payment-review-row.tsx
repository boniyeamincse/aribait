"use client";

import { useActionState, useState } from "react";

import { approveManualPayment, rejectManualPayment } from "@/lib/payments/actions";
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
    return (
      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
        Approved
      </span>
    );
  }
  if (rejectState?.ok) {
    return (
      <span className="rounded-full border border-red-500/30 bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-400">
        Rejected
      </span>
    );
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
          className="w-64 border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-600"
        />
        {rejectState?.ok === false && (
          <p className="text-sm text-red-400">{rejectState.error}</p>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={rejectPending}
            className="rounded-full border border-red-500/30 bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/25 disabled:opacity-50"
          >
            {rejectPending ? "Rejecting…" : "Confirm reject"}
          </button>
          <button
            type="button"
            onClick={() => setRejecting(false)}
            className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Back
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex gap-2">
      <form action={approveAction}>
        <button
          type="submit"
          disabled={approvePending}
          className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-50"
        >
          {approvePending ? "Approving…" : "Approve"}
        </button>
      </form>
      <button
        type="button"
        onClick={() => setRejecting(true)}
        className="rounded-full border border-red-500/30 bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/25"
      >
        Reject
      </button>
    </div>
  );
}
