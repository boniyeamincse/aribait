"use client";

import { useActionState } from "react";

import { submitReview } from "@/lib/reviews/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ReviewForm({
  eventId,
  existing,
}: {
  eventId: string;
  existing?: { rating: number; comment: string | null; published: boolean } | null;
}) {
  const [state, formAction, pending] = useActionState(
    submitReview.bind(null, eventId),
    null,
  );

  if (state?.ok) {
    return (
      <p className="text-xs text-muted-foreground">
        Thanks — your review is awaiting admin approval.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex items-end gap-2">
      <div className="flex flex-col gap-1">
        <Label htmlFor={`rating-${eventId}`} className="text-xs">
          Rating (1-5)
        </Label>
        <Input
          id={`rating-${eventId}`}
          name="rating"
          type="number"
          min={1}
          max={5}
          required
          defaultValue={existing?.rating}
          className="h-8 w-16"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor={`comment-${eventId}`} className="text-xs">
          Comment (optional)
        </Label>
        <Textarea
          id={`comment-${eventId}`}
          name="comment"
          rows={1}
          defaultValue={existing?.comment ?? undefined}
          className="h-8 w-56"
        />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : existing ? "Update review" : "Leave a review"}
      </Button>
      {state?.ok === false && (
        <p className="text-xs text-destructive">{state.error}</p>
      )}
    </form>
  );
}
