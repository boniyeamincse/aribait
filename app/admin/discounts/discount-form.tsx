"use client";

import { useActionState } from "react";

import { createCoupon } from "@/lib/discounts/actions";
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

const TYPE_LABELS: Record<string, string> = {
  PERCENTAGE: "Percentage",
  FIXED: "Fixed amount (৳)",
};

export function DiscountForm() {
  const [state, formAction, pending] = useActionState(createCoupon, null);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="code">Coupon code</Label>
          <Input id="code" name="code" required minLength={3} maxLength={40} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="type">Type</Label>
          <Select name="type" defaultValue="PERCENTAGE" required>
            <SelectTrigger id="type" className="w-full">
              <SelectValue>
                {(value: string | null) =>
                  value ? TYPE_LABELS[value] : "Select type"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="amount">Amount</Label>
          <Input id="amount" name="amount" type="number" min={1} required />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="minPurchaseBdt">Minimum purchase (৳)</Label>
          <Input
            id="minPurchaseBdt"
            name="minPurchaseBdt"
            type="number"
            min={0}
            defaultValue={0}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="maxDiscountBdt">Max discount (৳, blank = no cap)</Label>
          <Input id="maxDiscountBdt" name="maxDiscountBdt" type="number" min={1} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="maxTotalUsage">Total usage limit (blank = unlimited)</Label>
          <Input id="maxTotalUsage" name="maxTotalUsage" type="number" min={1} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="maxPerUserUsage">Per-user limit (blank = unlimited)</Label>
          <Input id="maxPerUserUsage" name="maxPerUserUsage" type="number" min={1} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="startsAt">Starts</Label>
          <Input id="startsAt" name="startsAt" type="datetime-local" />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="expiresAt">Expires</Label>
          <Input id="expiresAt" name="expiresAt" type="datetime-local" />
        </div>
      </div>

      {state?.ok === false && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Creating…" : "Create coupon"}
      </Button>
    </form>
  );
}
