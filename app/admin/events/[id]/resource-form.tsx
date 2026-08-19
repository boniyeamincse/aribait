"use client";

import { useActionState } from "react";

import { addEventResource, removeEventResource } from "@/lib/events/resource-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ResourceForm({ eventId }: { eventId: string }) {
  const [state, formAction, pending] = useActionState(
    addEventResource.bind(null, eventId),
    null,
  );

  return (
    <form action={formAction} className="flex items-end gap-2">
      <div className="flex flex-col gap-2">
        <label htmlFor="resource-title" className="text-xs text-muted-foreground">
          Title
        </label>
        <Input id="resource-title" name="title" required className="w-48" />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="resource-url" className="text-xs text-muted-foreground">
          URL
        </label>
        <Input id="resource-url" name="url" type="url" required className="w-64" />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Adding…" : "Add resource"}
      </Button>
      {state?.ok === false && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
    </form>
  );
}

export function RemoveResourceButton({ resourceId }: { resourceId: string }) {
  return (
    <form action={removeEventResource.bind(null, resourceId)}>
      <Button type="submit" size="sm" variant="destructive">
        Remove
      </Button>
    </form>
  );
}
