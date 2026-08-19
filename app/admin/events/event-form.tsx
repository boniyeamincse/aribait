"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toDatetimeLocalValue } from "@/lib/utils";

type ActionResult = { ok: true } | { ok: false; error: string };
type EventFormAction = (
  prevState: ActionResult | null,
  formData: FormData,
) => Promise<ActionResult>;

const EVENT_TYPE_LABELS: Record<string, string> = {
  LIVE_CLASS: "Live class",
  TRAINING_PROGRAM: "Training program",
  WORKSHOP: "Workshop",
  SEMINAR: "Seminar",
};

export function EventForm({
  action,
  categories,
  instructors,
  submitLabel,
  defaultValues,
}: {
  action: EventFormAction;
  categories: { id: string; name: string }[];
  instructors: { id: string; name: string }[];
  submitLabel: string;
  defaultValues?: {
    title: string;
    shortDescription: string;
    description: string;
    type: string;
    categoryId: string;
    instructorId: string;
    thumbnailUrl: string | null;
    learningObjectives: string | null;
    targetAudience: string | null;
    prerequisites: string | null;
    language: string;
    capacity: number | null;
    priceBdt: number;
    registrationOpensAt: Date | null;
    registrationClosesAt: Date | null;
    startAt: Date;
    endAt: Date;
    featured: boolean;
    termsAndRefundPolicy: string | null;
  };
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          minLength={3}
          maxLength={160}
          defaultValue={defaultValues?.title}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="shortDescription">Short description</Label>
        <Textarea
          id="shortDescription"
          name="shortDescription"
          rows={2}
          required
          minLength={10}
          maxLength={300}
          defaultValue={defaultValues?.shortDescription}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Full description</Label>
        <Textarea
          id="description"
          name="description"
          rows={6}
          required
          minLength={20}
          defaultValue={defaultValues?.description}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="type">Event type</Label>
          <Select name="type" defaultValue={defaultValues?.type} required>
            <SelectTrigger id="type" className="w-full">
              <SelectValue>
                {(value: string | null) =>
                  value ? EVENT_TYPE_LABELS[value] : "Select type"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="categoryId">Category</Label>
          <Select
            name="categoryId"
            defaultValue={defaultValues?.categoryId}
            required
          >
            <SelectTrigger id="categoryId" className="w-full">
              <SelectValue>
                {(value: string | null) =>
                  categories.find((c) => c.id === value)?.name ??
                  "Select category"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {categories.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No categories yet — add one first.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="instructorId">Instructor</Label>
          <Select
            name="instructorId"
            defaultValue={defaultValues?.instructorId}
            required
          >
            <SelectTrigger id="instructorId" className="w-full">
              <SelectValue>
                {(value: string | null) =>
                  instructors.find((i) => i.id === value)?.name ??
                  "Select instructor"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {instructors.map((instructor) => (
                <SelectItem key={instructor.id} value={instructor.id}>
                  {instructor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {instructors.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No instructors yet — add one first.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="language">Language</Label>
          <Input
            id="language"
            name="language"
            defaultValue={defaultValues?.language ?? "English"}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="capacity">Capacity (blank = unlimited)</Label>
          <Input
            id="capacity"
            name="capacity"
            type="number"
            min={1}
            defaultValue={defaultValues?.capacity ?? undefined}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="priceBdt">Price (৳, 0 = free)</Label>
          <Input
            id="priceBdt"
            name="priceBdt"
            type="number"
            min={0}
            required
            defaultValue={defaultValues?.priceBdt ?? 0}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="startAt">Event start</Label>
          <Input
            id="startAt"
            name="startAt"
            type="datetime-local"
            required
            defaultValue={
              defaultValues && toDatetimeLocalValue(defaultValues.startAt)
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="endAt">Event end</Label>
          <Input
            id="endAt"
            name="endAt"
            type="datetime-local"
            required
            defaultValue={
              defaultValues && toDatetimeLocalValue(defaultValues.endAt)
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="registrationOpensAt">Registration opens</Label>
          <Input
            id="registrationOpensAt"
            name="registrationOpensAt"
            type="datetime-local"
            defaultValue={
              defaultValues?.registrationOpensAt
                ? toDatetimeLocalValue(defaultValues.registrationOpensAt)
                : undefined
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="registrationClosesAt">Registration closes</Label>
          <Input
            id="registrationClosesAt"
            name="registrationClosesAt"
            type="datetime-local"
            defaultValue={
              defaultValues?.registrationClosesAt
                ? toDatetimeLocalValue(defaultValues.registrationClosesAt)
                : undefined
            }
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
        <Input
          id="thumbnailUrl"
          name="thumbnailUrl"
          type="url"
          defaultValue={defaultValues?.thumbnailUrl ?? undefined}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="learningObjectives">Learning objectives</Label>
        <Textarea
          id="learningObjectives"
          name="learningObjectives"
          rows={3}
          defaultValue={defaultValues?.learningObjectives ?? undefined}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="targetAudience">Intended audience</Label>
        <Textarea
          id="targetAudience"
          name="targetAudience"
          rows={2}
          defaultValue={defaultValues?.targetAudience ?? undefined}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="prerequisites">Prerequisites</Label>
        <Textarea
          id="prerequisites"
          name="prerequisites"
          rows={2}
          defaultValue={defaultValues?.prerequisites ?? undefined}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="termsAndRefundPolicy">Terms and refund policy</Label>
        <Textarea
          id="termsAndRefundPolicy"
          name="termsAndRefundPolicy"
          rows={2}
          defaultValue={defaultValues?.termsAndRefundPolicy ?? undefined}
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="featured"
          name="featured"
          defaultChecked={defaultValues?.featured}
        />
        <Label htmlFor="featured">Featured on homepage</Label>
      </div>

      {state?.ok === false && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
