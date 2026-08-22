import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/db/client";
import { createEvent } from "@/lib/events/actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

import { EventForm } from "../event-form";

export default async function NewEventPage() {
  const [categories, instructors] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.instructor.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col gap-4">
        <Link 
          href="/admin/events"
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors w-fit"
        >
          <ArrowLeft size={16} />
          Back to Events
        </Link>
        <AdminPageHeader 
          title="Create New Event" 
          description="Set up a new live class, workshop, or training program. Fill in the details below to get started." 
        />
      </div>

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
