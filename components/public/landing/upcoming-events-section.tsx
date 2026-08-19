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
  HOT: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  NEW: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  FREE: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
};

export async function UpcomingEventsSection() {
  const events = await listUpcomingEventsForLanding(3);

  return (
    <section className="bg-slate-950 py-20">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div className="mb-12 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-cyan-400">
              Upcoming Events
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Start learning this month
            </h2>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-transparent px-4 py-2 text-sm text-slate-300 transition-all hover:bg-slate-800 hover:text-white"
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const tag = tagFor(event);
              return (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="group block"
                >
                  <Card className="h-full border-slate-800 bg-slate-900 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-cyan-500/50 group-hover:shadow-xl group-hover:shadow-cyan-500/10">
                    <CardHeader className="pb-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <Badge
                          variant="outline"
                          className="border-slate-700 text-slate-400"
                        >
                          {TYPE_LABELS[event.type] ?? event.type}
                        </Badge>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${TAG_COLORS[tag]}`}
                        >
                          {tag}
                        </span>
                      </div>
                      <CardTitle className="text-lg text-white group-hover:text-cyan-300 transition-colors">
                        {event.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                      <p className="line-clamp-2 text-sm text-slate-400">
                        {event.shortDescription}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{event.category.name}</span>
                        <span>·</span>
                        <span>{event.instructor.name}</span>
                        <span>·</span>
                        <span>
                          {event._count.sessions} session
                          {event._count.sessions === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                        <span className="text-xs text-slate-500">
                          {event.startAt.toLocaleString("en-GB", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                        <span className="text-sm font-bold text-cyan-400">
                          {event.priceBdt === 0
                            ? "Free"
                            : `৳${event.priceBdt.toLocaleString()}`}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
