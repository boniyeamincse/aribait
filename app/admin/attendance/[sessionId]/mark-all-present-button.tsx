"use client";

import { useState, useTransition } from "react";

import { markAllPresent } from "@/lib/attendance/actions";

export function MarkAllPresentButton({
  eventSessionId,
  action = markAllPresent,
}: {
  eventSessionId: string;
  action?: (eventSessionId: string) => Promise<unknown>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (confirming) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-600">Mark every confirmed student present?</span>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await action(eventSessionId);
              setConfirming(false);
            })
          }
          className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-50"
        >
          {pending ? "Marking…" : "Yes, mark all present"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/25"
    >
      Mark all present
    </button>
  );
}
