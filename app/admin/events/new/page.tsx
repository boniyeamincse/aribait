import { prisma } from "@/lib/db/client";
import { createEvent } from "@/lib/events/actions";

import { EventForm } from "../event-form";

export default async function NewEventPage() {
  const [categories, instructors] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.instructor.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Create Event</h1>
      <EventForm
        action={createEvent}
        categories={categories}
        instructors={instructors}
        submitLabel="Create Event"
        mode="wizard"
      />
    </div>
  );
}
