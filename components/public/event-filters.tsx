"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EVENT_TYPE_LABELS: Record<string, string> = {
  LIVE_CLASS: "Live class",
  TRAINING_PROGRAM: "Training program",
  WORKSHOP: "Workshop",
  SEMINAR: "Seminar",
};

const PRICING_LABELS: Record<string, string> = {
  any: "Any",
  free: "Free",
  paid: "Paid",
};

const SORT_LABELS: Record<string, string> = {
  newest: "Newest",
  upcoming: "Upcoming",
  popular: "Popular",
  price: "Price",
};

export function EventFilters({
  categories,
  defaultValues,
  showType = true,
}: {
  categories: { id: string; name: string }[];
  defaultValues: {
    q?: string;
    category?: string;
    type?: string;
    pricing?: string;
    sort?: string;
  };
  showType?: boolean;
}) {
  return (
    <form
      method="get"
      className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <h3 className="text-sm font-bold tracking-wider text-slate-900 uppercase mb-4">Filter Events</h3>
      </div>
      
      <div className="flex flex-col gap-2.5">
        <label htmlFor="q" className="text-sm font-semibold text-slate-700">
          Search
        </label>
        <Input
          id="q"
          name="q"
          placeholder="Keyword..."
          defaultValue={defaultValues.q}
          className="w-full bg-slate-50 border-slate-200 focus:bg-white transition-colors"
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <label className="text-sm font-semibold text-slate-700">Category</label>
        <Select name="category" defaultValue={defaultValues.category ?? "any"}>
          <SelectTrigger className="w-full bg-slate-50 border-slate-200 focus:bg-white transition-colors">
            <SelectValue>
              {(value: string | null) =>
                value && value !== "any"
                  ? (categories.find((c) => c.id === value)?.name ?? "Any category")
                  : "Any category"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any category</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showType && (
        <div className="flex flex-col gap-2.5">
          <label className="text-sm font-semibold text-slate-700">Event Type</label>
          <Select name="type" defaultValue={defaultValues.type ?? "any"}>
            <SelectTrigger className="w-full bg-slate-50 border-slate-200 focus:bg-white transition-colors">
              <SelectValue>
                {(value: string | null) =>
                  value && value !== "any"
                    ? (EVENT_TYPE_LABELS[value] ?? "Any type")
                    : "Any type"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any type</SelectItem>
              {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        <label className="text-sm font-semibold text-slate-700">Pricing</label>
        <Select name="pricing" defaultValue={defaultValues.pricing ?? "any"}>
          <SelectTrigger className="w-full bg-slate-50 border-slate-200 focus:bg-white transition-colors">
            <SelectValue>
              {(value: string | null) => (value ? PRICING_LABELS[value] : "Any price")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any price</SelectItem>
            <SelectItem value="free">Free Events</SelectItem>
            <SelectItem value="paid">Premium Events</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2.5 border-t border-slate-100 pt-5 mt-2">
        <label className="text-sm font-semibold text-slate-700">Sort By</label>
        <Select name="sort" defaultValue={defaultValues.sort ?? "newest"}>
          <SelectTrigger className="w-full bg-slate-50 border-slate-200 focus:bg-white transition-colors">
            <SelectValue>
              {(value: string | null) => (value ? SORT_LABELS[value] : "Newest First")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="price">Price (Low to High)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all active:scale-95">
        Apply Filters
      </Button>
    </form>
  );
}
