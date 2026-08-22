"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

import { ReversePaymentForm } from "./reverse-payment-form";

export function ReversePaymentDialog({ paymentId }: { paymentId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600 active:scale-95"
          >
            Reverse
          </button>
        }
      />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reverse Payment</DialogTitle>
          <DialogDescription>
            The record is kept — this only marks it reversed and excludes it from the paid total. Corrections cannot be undone by deleting.
          </DialogDescription>
        </DialogHeader>
        <ReversePaymentForm paymentId={paymentId} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
