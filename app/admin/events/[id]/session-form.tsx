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
import { toDatetimeLocalValue } from "@/lib/utils";

type ActionResult = { ok: true } | { ok: false; error: string };
type SessionFormAction = (
  prevState: ActionResult | null,
  formData: FormData,
) => Promise<ActionResult>;

const PLATFORM_LABELS: Record<string, string> = {
  ZOOM: "Zoom",
  GOOGLE_MEET: "Google Meet",
  MICROSOFT_TEAMS: "Microsoft Teams",
  CUSTOM: "Custom",
};

export function SessionForm({
  action,
  instructors,
  nextSequence,
  submitLabel,
  defaultValues,
  onSuccess,
}: {
  action: SessionFormAction;
  instructors: { id: string; name: string }[];
  nextSequence: number;
  submitLabel: string;
  defaultValues?: {
    title: string;
    sequence: number;
    description: string | null;
    startAt: Date;
    endAt: Date;
    timeZone: string;
    hostInstructorId: string | null;
    platform: string;
    meetingId: string | null;
    meetingUrl: string | null;
    meetingPasscode: string | null;
  };
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    async (prev: ActionResult | null, formData: FormData) => {
      const result = await action(prev, formData);
      if (result.ok) onSuccess?.();
      return result;
    },
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Session title</Label>
          <Input
            id="title"
            name="title"
            required
            minLength={3}
            defaultValue={defaultValues?.title}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="sequence">Sequence</Label>
          <Input
            id="sequence"
            name="sequence"
            type="number"
            min={1}
            required
            defaultValue={defaultValues?.sequence ?? nextSequence}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description / agenda</Label>
        <Textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={defaultValues?.description ?? undefined}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="startAt">Start</Label>
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
          <Label htmlFor="endAt">End</Label>
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
          <Label htmlFor="timeZone">Time zone</Label>
          <Input
            id="timeZone"
            name="timeZone"
            defaultValue={defaultValues?.timeZone ?? "Asia/Dhaka"}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="hostInstructorId">Host</Label>
          <Select
            name="hostInstructorId"
            defaultValue={defaultValues?.hostInstructorId ?? undefined}
            required
          >
            <SelectTrigger id="hostInstructorId" className="w-full">
              <SelectValue>
                {(value: string | null) =>
                  instructors.find((i) => i.id === value)?.name ??
                  "Select host"
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
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="platform">Platform</Label>
          <Select
            name="platform"
            defaultValue={defaultValues?.platform}
            required
          >
            <SelectTrigger id="platform" className="w-full">
              <SelectValue>
                {(value: string | null) =>
                  value ? PLATFORM_LABELS[value] : "Select platform"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PLATFORM_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="meetingId">Meeting ID</Label>
          <Input
            id="meetingId"
            name="meetingId"
            defaultValue={defaultValues?.meetingId ?? undefined}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="meetingUrl">Meeting URL (protected — never shown publicly)</Label>
        <Input
          id="meetingUrl"
          name="meetingUrl"
          type="url"
          defaultValue={defaultValues?.meetingUrl ?? undefined}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="meetingPasscode">Passcode</Label>
        <Input
          id="meetingPasscode"
          name="meetingPasscode"
          defaultValue={defaultValues?.meetingPasscode ?? undefined}
        />
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
