import { redirect } from "next/navigation";

import { requireInstructor } from "@/lib/permissions";
import { isEligibleToCreateEvents, INELIGIBLE_MESSAGE } from "@/lib/instructors/eligibility";
import { createInstructorEvent } from "@/lib/instructors/event-actions";
import { prisma } from "@/lib/db/client";

import { InstructorEventForm } from "../instructor-event-form";

export default async function NewInstructorEventPage() {
  const { user, instructor } = await requireInstructor();

  if (!isEligibleToCreateEvents(user, instructor)) {
    return (
      <div className="max-w-md rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700">
        {INELIGIBLE_MESSAGE}
      </div>
    );
  }

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  if (categories.length === 0) {
    redirect("/instructor/events");
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Create Event</h1>
      <InstructorEventForm action={createInstructorEvent} categories={categories} submitLabel="Create Event" />
    </div>
  );
}
