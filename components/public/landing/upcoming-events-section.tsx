import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listUpcomingEventsForLanding } from "@/lib/events/queries";

function tagFor(event: { priceBdt: number; featured: boolean }) {
  if (event.priceBdt === 0) return "FREE";
  if (event.featured) return "HOT";
  return "NEW";
}

const TYPE_LABELS: Record<string, string> = {
  LIVE_CLASS: "Live Class",
  TRAINING_PROGRAM: "Training",
  WORKSHOP: "Workshop",
  SEMINAR: "Seminar",
};

const TAG_COLORS: Record<string, string> = {
  HOT: "bg-orange-50 text-orange-700 border-orange-300",
  NEW: "bg-emerald-50 text-emerald-700 border-emerald-300",
  FREE: "bg-blue-50 text-blue-700 border-blue-300",
};

export async function UpcomingEventsSection() {
  const events = await listUpcomingEventsForLanding(3);

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div className="mb-12 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-600">
              Upcoming Events
            </p>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Start learning this month
            </h2>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-transparent px-4 py-2 text-sm text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-900"
          >
            View all events →
          </Link>
        </div>

        {/* Cards */}
        {events.length === 0 ? (
          <p className="text-slate-500">
            No upcoming Events published yet — check back soon.
          </p>
        ) : (
          <div className="flex flex-wrap justify-center gap-6">
            {events.map((event) => {
              const tag = tagFor(event);
              return (
                <Card
                  key={event.id}
                  className="group relative h-full w-full overflow-hidden border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
                >
                  <Link
                    href={`/events/${event.slug}`}
                    className="absolute inset-0 z-0"
                    aria-label={event.title}
                  />
                  {event.thumbnailUrl ? (
                    // Admin-entered arbitrary URL; next/image requires an allowlisted
                    // remote pattern that doesn't exist for this codebase yet.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={event.thumbnailUrl} alt="" className="aspect-video w-full object-cover" />
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-emerald-50">
                      <span className="text-sm font-semibold tracking-tight text-slate-400">
                        {TYPE_LABELS[event.type] ?? event.type}
                      </span>
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <Badge
                        variant="outline"
                        className="border-slate-300 text-slate-600"
                      >
                        {TYPE_LABELS[event.type] ?? event.type}
                      </Badge>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${TAG_COLORS[tag]}`}
                      >
                        {tag}
                      </span>
                    </div>
                    <CardTitle className="text-lg text-slate-900 group-hover:text-blue-700 transition-colors">
                      {event.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <p className="line-clamp-2 text-sm text-slate-600">
                      {event.shortDescription}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{event.category.name}</span>
                      <span>·</span>
                      <Link
                        href={`/instructors/${event.instructor.slug}`}
                        className="relative z-10 hover:text-blue-700 hover:underline"
                      >
                        {event.instructor.name}
                      </Link>
                      <span>·</span>
                      <span>
                        {event._count.sessions} session
                        {event._count.sessions === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                      <span className="text-xs text-slate-500">
                        {event.startAt.toLocaleString("en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                      <span className="text-sm font-bold text-blue-600">
                        {event.priceBdt === 0
                          ? "Free"
                          : `৳${event.priceBdt.toLocaleString()}`}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
