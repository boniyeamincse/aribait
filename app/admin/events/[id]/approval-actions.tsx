"use client";

import { useActionState, useState } from "react";

import { approveEvent, rejectEvent, requestEventChanges } from "@/lib/events/approval-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ActionResult = { ok: true } | { ok: false; error: string };

function ReasonForm({
  action,
  label,
  placeholder,
  pendingLabel,
}: {
  action: (prevState: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  label: string;
  placeholder: string;
  pendingLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(action, null);

  if (!open) {
    return (
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        {label}
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-2 rounded-lg border border-slate-200 p-3">
      <Textarea name={label === "Reject" ? "reason" : "note"} rows={2} required placeholder={placeholder} />
      {state?.ok === false && <p className="text-sm text-destructive">{state.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? pendingLabel : `Confirm ${label}`}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function ApprovalActions({ eventId }: { eventId: string }) {
  return (
    <div className="flex flex-wrap items-start gap-2">
      <form action={approveEvent.bind(null, eventId)}>
        <Button type="submit" size="sm">
          Approve
        </Button>
      </form>
      <ReasonForm
        action={requestEventChanges.bind(null, eventId)}
        label="Request Changes"
        placeholder="What needs to change before this can be approved?"
        pendingLabel="Sending…"
      />
      <ReasonForm
        action={rejectEvent.bind(null, eventId)}
        label="Reject"
        placeholder="Why is this Event being rejected?"
        pendingLabel="Rejecting…"
      />
    </div>
  );
}
