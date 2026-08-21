"use client";

import { useActionState } from "react";

import { addInstructorEventResource } from "@/lib/instructors/resource-actions";
import type { Event, EventResource } from "@/lib/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ResourcesTab({ event }: { event: Event & { resources: EventResource[] } }) {
  const [state, formAction, pending] = useActionState(
    addInstructorEventResource.bind(null, event.id),
    null,
  );

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <div className="divide-y divide-slate-200 rounded-lg border border-slate-200">
        {event.resources.length === 0 && (
          <p className="p-4 text-sm text-slate-500">No course materials added yet.</p>
        )}
        {event.resources.map((resource) => (
          <div key={resource.id} className="p-3 text-sm">
            <p className="font-medium text-slate-900">{resource.title}</p>
            <p className="truncate text-slate-500">{resource.url}</p>
          </div>
        ))}
      </div>

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
      </form>
      {state?.ok === false && <p className="text-sm text-destructive">{state.error}</p>}
    </div>
  );
}
