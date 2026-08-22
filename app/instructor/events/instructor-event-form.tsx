"use client";

import { useActionState } from "react";

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
import { Textarea } from "@/components/ui/textarea";
import { RichTextarea } from "@/components/shared/rich-textarea";
import { FormWizard } from "@/components/shared/form-wizard";
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

const DELIVERY_MODE_LABELS: Record<string, string> = {
  ONLINE: "Online",
  OFFLINE: "Offline",
  HYBRID: "Hybrid",
};

const SKILL_LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  ALL_LEVELS: "All levels",
};

const EVENT_LANGUAGES = ["English", "Bangla", "Hindi", "Urdu"];

export function InstructorEventForm({
  action,
  categories,
  submitLabel,
  defaultValues,
  mode = "flat",
}: {
  action: EventFormAction;
  categories: { id: string; name: string }[];
  submitLabel: string;
  mode?: "flat" | "wizard";
  defaultValues?: {
    title: string;
    shortDescription: string;
    description: string;
    type: string;
    categoryId: string;
    thumbnailUrl: string | null;
    learningObjectives: string | null;
    targetAudience: string | null;
    prerequisites: string | null;
    language: string;
    capacity: number | null;
    priceBdt: number;
    compareAtPriceBdt: number | null;
    registrationOpensAt: Date | null;
    registrationClosesAt: Date | null;
    startAt: Date;
    endAt: Date;
    termsAndRefundPolicy: string | null;
    classSchedule: string | null;
    minAttendanceSessions: number | null;
    deliveryMode: string;
    location: string | null;
    skillLevel: string;
    promoVideoUrl: string | null;
  };
}) {
  const [state, formAction, pending] = useActionState(action, null);

  const stepBasics = (
    <>
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
        <RichTextarea
          id="description"
          name="description"
          rows={6}
          required
          minLength={20}
          defaultValue={defaultValues?.description}
        />
      </div>
    </>
  );

  const stepCategory = (
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
        <Select name="categoryId" defaultValue={defaultValues?.categoryId} required>
          <SelectTrigger id="categoryId" className="w-full">
            <SelectValue>
              {(value: string | null) =>
                categories.find((c) => c.id === value)?.name ?? "Select category"
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
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="deliveryMode">Delivery mode</Label>
        <Select name="deliveryMode" defaultValue={defaultValues?.deliveryMode ?? "ONLINE"} required>
          <SelectTrigger id="deliveryMode" className="w-full">
            <SelectValue>
              {(value: string | null) => (value ? DELIVERY_MODE_LABELS[value] : "Select mode")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DELIVERY_MODE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="location">Location (required for offline/hybrid)</Label>
        <Input id="location" name="location" defaultValue={defaultValues?.location ?? undefined} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="skillLevel">Skill level</Label>
        <Select name="skillLevel" defaultValue={defaultValues?.skillLevel ?? "ALL_LEVELS"} required>
          <SelectTrigger id="skillLevel" className="w-full">
            <SelectValue>
              {(value: string | null) => (value ? SKILL_LEVEL_LABELS[value] : "Select level")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SKILL_LEVEL_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="language">Language</Label>
        <Select name="language" defaultValue={defaultValues?.language ?? "English"} required>
          <SelectTrigger id="language" className="w-full">
            <SelectValue>{(value: string | null) => value ?? "Select language"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {EVENT_LANGUAGES.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="classSchedule">Class schedule</Label>
        <Input
          id="classSchedule"
          name="classSchedule"
          placeholder="e.g., Mon, Wed, Fri at 9:00 PM"
          defaultValue={defaultValues?.classSchedule ?? undefined}
        />
      </div>
    </div>
  );

  const stepPricing = (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="capacity">Capacity</Label>
        <Input
          id="capacity"
          name="capacity"
          type="number"
          min={1}
          required
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
        <Label htmlFor="compareAtPriceBdt">Regular price (৳, blank = no discount shown)</Label>
        <Input
          id="compareAtPriceBdt"
          name="compareAtPriceBdt"
          type="number"
          min={0}
          defaultValue={defaultValues?.compareAtPriceBdt ?? undefined}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="minAttendanceSessions">
          Minimum Sessions attended for certificate (blank = no requirement)
        </Label>
        <Input
          id="minAttendanceSessions"
          name="minAttendanceSessions"
          type="number"
          min={1}
          defaultValue={defaultValues?.minAttendanceSessions ?? undefined}
        />
      </div>
    </div>
  );

  const stepSchedule = (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="startAt">Event start</Label>
        <Input
          id="startAt"
          name="startAt"
          type="datetime-local"
          required
          defaultValue={defaultValues && toDatetimeLocalValue(defaultValues.startAt)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="endAt">Event end</Label>
        <Input
          id="endAt"
          name="endAt"
          type="datetime-local"
          required
          defaultValue={defaultValues && toDatetimeLocalValue(defaultValues.endAt)}
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
  );

  const stepContent = (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor="thumbnailUrl">Cover image URL</Label>
        <Input
          id="thumbnailUrl"
          name="thumbnailUrl"
          type="url"
          required
          defaultValue={defaultValues?.thumbnailUrl ?? undefined}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="promoVideoUrl">Promotional video URL</Label>
        <Input
          id="promoVideoUrl"
          name="promoVideoUrl"
          type="url"
          defaultValue={defaultValues?.promoVideoUrl ?? undefined}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="learningObjectives">Learning objectives</Label>
        <Textarea
          id="learningObjectives"
          name="learningObjectives"
          rows={3}
          required
          defaultValue={defaultValues?.learningObjectives ?? undefined}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="targetAudience">Intended audience</Label>
        <Textarea
          id="targetAudience"
          name="targetAudience"
          rows={2}
          required
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
    </>
  );

  if (mode === "wizard") {
    return (
      <FormWizard
        action={formAction}
        pending={pending}
        submitLabel={submitLabel}
        submitError={state?.ok === false ? state.error : undefined}
        steps={[
          { label: "Basics", content: stepBasics },
          { label: "Category & Format", content: stepCategory },
          { label: "Pricing & Capacity", content: stepPricing },
          { label: "Schedule", content: stepSchedule },
          { label: "Content & Media", content: stepContent },
        ]}
      />
    );
  }

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      {stepBasics}
      {stepCategory}
      {stepPricing}
      {stepSchedule}
      {stepContent}

      {state?.ok === false && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
