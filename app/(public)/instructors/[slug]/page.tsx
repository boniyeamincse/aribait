import { notFound } from "next/navigation";

import { prisma } from "@/lib/db/client";
import { EventCard } from "@/components/public/event-card";

export default async function InstructorProfilePage({
  params,
}: PageProps<"/instructors/[slug]">) {
  const { slug } = await params;

  const instructor = await prisma.instructor.findUnique({
    where: { slug },
    include: {
      events: {
        where: { status: "PUBLISHED" },
        orderBy: { startAt: "asc" },
        include: { category: true, instructor: true },
      },
    },
  });

  if (!instructor) notFound();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        {instructor.name}
      </h1>
      {instructor.title && (
        <p className="mt-1 text-muted-foreground">{instructor.title}</p>
      )}
      {instructor.bio && <p className="mt-4 max-w-2xl">{instructor.bio}</p>}

      <h2 className="mt-10 text-lg font-medium">Published Events</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {instructor.events.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No published Events from this instructor yet.
          </p>
        )}
        {instructor.events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
