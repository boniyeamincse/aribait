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
      className="flex flex-wrap items-end gap-3 rounded-lg border p-4"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="q" className="text-xs text-muted-foreground">
          Search
        </label>
        <Input
          id="q"
          name="q"
          placeholder="Keyword"
          defaultValue={defaultValues.q}
          className="w-48"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-muted-foreground">Category</label>
        <Select name="category" defaultValue={defaultValues.category ?? "any"}>
          <SelectTrigger className="w-40">
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
        <div className="flex flex-col gap-2">
          <label className="text-xs text-muted-foreground">Type</label>
          <Select name="type" defaultValue={defaultValues.type ?? "any"}>
            <SelectTrigger className="w-40">
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

      <div className="flex flex-col gap-2">
        <label className="text-xs text-muted-foreground">Pricing</label>
        <Select name="pricing" defaultValue={defaultValues.pricing ?? "any"}>
          <SelectTrigger className="w-32">
            <SelectValue>
              {(value: string | null) => (value ? PRICING_LABELS[value] : "Any")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-muted-foreground">Sort</label>
        <Select name="sort" defaultValue={defaultValues.sort ?? "newest"}>
          <SelectTrigger className="w-36">
            <SelectValue>
              {(value: string | null) => (value ? SORT_LABELS[value] : "Newest")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="popular">Popular</SelectItem>
            <SelectItem value="price">Price</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" size="sm">
        Apply
      </Button>
    </form>
  );
}
