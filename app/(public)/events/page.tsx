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
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Explore IT Training Events</h1>
        <p className="mt-3 text-lg text-slate-600 max-w-2xl">
          Browse our live classes, training programs, and workshops designed to level up your tech career.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <EventFilters
            categories={categories}
            defaultValues={{ q, category, type, pricing, sort }}
          />
        </div>

        {/* Event Cards Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {events.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <p className="text-lg font-medium text-slate-500">
                  No Events match your filters.
                </p>
                <p className="text-sm text-slate-400 mt-1">Try adjusting your search criteria.</p>
              </div>
            )}
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
