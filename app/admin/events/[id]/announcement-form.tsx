"use client";

import { useActionState } from "react";

import { sendAnnouncement } from "@/lib/events/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function AnnouncementForm({ eventId }: { eventId: string }) {
  const [state, formAction, pending] = useActionState(
    sendAnnouncement.bind(null, eventId),
    null,
  );

  if (state?.ok) {
    return (
      <p className="text-sm text-muted-foreground">
        Announcement sent to confirmed and waitlisted registrants.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor="announcement-title">Title</Label>
        <Input id="announcement-title" name="title" required minLength={3} maxLength={160} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="announcement-body">Message</Label>
        <Textarea id="announcement-body" name="body" rows={3} required minLength={5} />
      </div>
      {state?.ok === false && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" size="sm" disabled={pending} className="self-start">
        {pending ? "Sending…" : "Send announcement"}
      </Button>
    </form>
  );
}
