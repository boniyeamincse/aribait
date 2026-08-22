"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

import { PaymentForm } from "./payment-form";

export function RecordPaymentDialog({
  instructorId,
  availableBalance,
}: {
  instructorId: string;
  availableBalance: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Record Payment
          </Button>
        }
      />
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            The system only records that you paid the Instructor externally — no money moves automatically.
          </DialogDescription>
        </DialogHeader>
        <PaymentForm
          instructorId={instructorId}
          availableBalance={availableBalance}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
