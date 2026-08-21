import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBdt } from "@/lib/utils";

const EVENT_TYPE_LABELS: Record<string, string> = {
  LIVE_CLASS: "Live class",
  TRAINING_PROGRAM: "Training program",
  WORKSHOP: "Workshop",
  SEMINAR: "Seminar",
};

export function EventCard({
  event,
}: {
  event: {
    slug: string;
    title: string;
    shortDescription: string;
    type: string;
    priceBdt: number;
    startAt: Date;
    category: { name: string };
    instructor: { name: string; slug: string };
  };
}) {
  return (
    <Card className="relative h-full transition-colors hover:bg-accent/50">
      <Link
        href={`/events/${event.slug}`}
        className="absolute inset-0 z-0"
        aria-label={event.title}
      />
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline">{EVENT_TYPE_LABELS[event.type] ?? event.type}</Badge>
          <span className="text-sm font-medium">
            {formatBdt(event.priceBdt)}
          </span>
        </div>
        <CardTitle className="mt-1">{event.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
        <p className="line-clamp-2">{event.shortDescription}</p>
        <p>
          {event.category.name} ·{" "}
          <Link
            href={`/instructors/${event.instructor.slug}`}
            className="relative z-10 underline-offset-4 hover:underline"
          >
            {event.instructor.name}
          </Link>
        </p>
        <p>
          {event.startAt.toLocaleString("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </CardContent>
    </Card>
  );
}
