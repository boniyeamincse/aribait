import Link from "next/link";

import { prisma } from "@/lib/db/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBdt } from "@/lib/utils";

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      category: true,
      instructor: true,
      _count: { select: { registrations: true, sessions: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
        <Button render={<Link href="/admin/events/new">Create Event</Link>} />
      </div>

      <div className="divide-y rounded-lg border">
        {events.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">
            No Events yet. Create one to get started.
          </p>
        )}
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/admin/events/${event.id}`}
            className="flex items-center justify-between gap-4 p-4 text-sm hover:bg-accent"
          >
            <div>
              <p className="font-medium">{event.title}</p>
              <p className="text-muted-foreground">
                {event.category.name} · {event.instructor.name} ·{" "}
                {formatBdt(event.priceBdt)} · {event._count.sessions} session
                {event._count.sessions === 1 ? "" : "s"} ·{" "}
                {event._count.registrations} registration
                {event._count.registrations === 1 ? "" : "s"}
              </p>
            </div>
            <Badge variant="secondary">{event.status}</Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
