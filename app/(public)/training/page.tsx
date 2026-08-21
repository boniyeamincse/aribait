import { prisma } from "@/lib/db/client";
import { listPublishedEvents } from "@/lib/events/queries";
import { EventCard } from "@/components/public/event-card";
import { EventFilters } from "@/components/public/event-filters";

export default async function TrainingPage({
  searchParams,
}: PageProps<"/training">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const category = typeof params.category === "string" ? params.category : undefined;
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
      type: "TRAINING_PROGRAM",
      pricing,
      sort,
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Training Programs</h1>
      <p className="mt-2 text-muted-foreground">
        Multi-session professional training programs and bootcamps.
      </p>

      <div className="mt-6">
        <EventFilters
          categories={categories}
          defaultValues={{ q, category, pricing, sort }}
          showType={false}
        />
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {events.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No Training programs match your filters.
          </p>
        )}
        {events.map((event) => (
          <div key={event.id} className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)]">
            <EventCard event={event} />
          </div>
        ))}
      </div>
    </div>
  );
}
