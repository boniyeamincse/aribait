import { prisma } from "@/lib/db/client";
import { listPublishedEvents } from "@/lib/events/queries";
import { EventCard } from "@/components/public/event-card";
import { EventFilters } from "@/components/public/event-filters";

export default async function EventsPage({
  searchParams,
}: PageProps<"/events">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const category = typeof params.category === "string" ? params.category : undefined;
  const type = typeof params.type === "string" ? params.type : undefined;
  const pricing =
    params.pricing === "free" || params.pricing === "paid"
      ? params.pricing
      : undefined;
  const sort =
    typeof params.sort === "string"
      ? (params.sort as "newest" | "upcoming" | "popular" | "price")
      : undefined;

  const [events, categories] = await Promise.all([
    listPublishedEvents({
      q,
      categoryId: category && category !== "any" ? category : undefined,
      type: type && type !== "any" ? type : undefined,
      pricing,
      sort,
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
      <p className="mt-2 text-muted-foreground">
        Browse published live classes, training programs and workshops.
      </p>

      <div className="mt-6">
        <EventFilters
          categories={categories}
          defaultValues={{ q, category, type, pricing, sort }}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No Events match your filters.
          </p>
        )}
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
