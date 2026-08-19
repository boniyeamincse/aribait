import { prisma } from "@/lib/db/client";

import { InstructorForm } from "./instructor-form";

export default async function AdminInstructorsPage() {
  const instructors = await prisma.instructor.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { events: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Instructors</h1>
      <InstructorForm />
      <div className="max-w-2xl divide-y rounded-lg border">
        {instructors.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">
            No instructors yet.
          </p>
        )}
        {instructors.map((instructor) => (
          <div key={instructor.id} className="flex items-center justify-between p-3 text-sm">
            <div>
              <p className="font-medium">{instructor.name}</p>
              {instructor.title && (
                <p className="text-muted-foreground">{instructor.title}</p>
              )}
            </div>
            <span className="text-muted-foreground">
              {instructor._count.events} Event
              {instructor._count.events === 1 ? "" : "s"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
