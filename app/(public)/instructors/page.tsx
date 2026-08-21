import Link from "next/link";

import { prisma } from "@/lib/db/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function InstructorsPage() {
  const instructors = await prisma.instructor.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { events: { where: { status: "PUBLISHED" } } } } },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Instructors</h1>
      <p className="mt-2 text-muted-foreground">
        Meet the instructors behind Ariba IT&apos;s live classes and training.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {instructors.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No instructor profiles published yet.
          </p>
        )}
        {instructors.map((instructor) => (
          <Link
            key={instructor.id}
            href={`/instructors/${instructor.slug}`}
            className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)]"
          >
            <Card className="h-full transition-colors hover:bg-accent/50">
              <CardHeader>
                <CardTitle>{instructor.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {instructor.title && <p>{instructor.title}</p>}
                <p>
                  {instructor._count.events} published Event
                  {instructor._count.events === 1 ? "" : "s"}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
