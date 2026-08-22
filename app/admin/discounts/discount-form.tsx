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
    <form action={formAction} className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-2">
        <Label htmlFor="code" className="text-slate-700 font-medium">Coupon Code <span className="text-red-500">*</span></Label>
        <Input id="code" name="code" required minLength={3} maxLength={40} className="focus-visible:ring-indigo-500 uppercase font-mono" placeholder="e.g. SUMMER2024" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="type" className="text-slate-700 text-sm">Discount Type</Label>
          <Select name="type" defaultValue="PERCENTAGE" required>
            <SelectTrigger id="type" className="w-full focus-visible:ring-indigo-500">
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
          <Label htmlFor="amount" className="text-slate-700 text-sm">Value <span className="text-red-500">*</span></Label>
          <Input id="amount" name="amount" type="number" min={1} required className="focus-visible:ring-indigo-500" placeholder="e.g. 10" />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Usage Restrictions</p>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="minPurchaseBdt" className="text-slate-700 text-xs">Min. Purchase (৳)</Label>
            <Input
              id="minPurchaseBdt"
              name="minPurchaseBdt"
              type="number"
              min={0}
              defaultValue={0}
              className="focus-visible:ring-indigo-500 text-sm h-9"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="maxDiscountBdt" className="text-slate-700 text-xs">Max Cap (৳)</Label>
            <Input id="maxDiscountBdt" name="maxDiscountBdt" type="number" min={1} className="focus-visible:ring-indigo-500 text-sm h-9" placeholder="No limit" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="maxTotalUsage" className="text-slate-700 text-xs">Total Limit</Label>
            <Input id="maxTotalUsage" name="maxTotalUsage" type="number" min={1} className="focus-visible:ring-indigo-500 text-sm h-9" placeholder="Unlimited" />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="maxPerUserUsage" className="text-slate-700 text-xs">Per-User Limit</Label>
            <Input id="maxPerUserUsage" name="maxPerUserUsage" type="number" min={1} className="focus-visible:ring-indigo-500 text-sm h-9" placeholder="Unlimited" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="startsAt" className="text-slate-700 text-xs">Starts (Optional)</Label>
          <Input id="startsAt" name="startsAt" type="datetime-local" className="focus-visible:ring-indigo-500 text-xs h-9" />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="expiresAt" className="text-slate-700 text-xs">Expires (Optional)</Label>
          <Input id="expiresAt" name="expiresAt" type="datetime-local" className="focus-visible:ring-indigo-500 text-xs h-9" />
        </div>
      </div>

      {state?.ok === false && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 mt-2">
          {state.error}
        </div>
      )}
      
      <div className="pt-2 mt-2 border-t border-slate-100">
        <Button type="submit" disabled={pending} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
          {pending ? "Creating Coupon…" : "Create Discount Coupon"}
        </Button>
      </div>
    </form>
  );
}
