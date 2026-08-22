import { notFound } from "next/navigation";
import { Star } from "lucide-react";

import { prisma } from "@/lib/db/client";
import { EventCard } from "@/components/public/event-card";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={s <= rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}
        />
      ))}
    </div>
  );
}

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
        include: {
          category: true,
          instructor: true,
          reviews: {
            where: { published: true },
            select: { rating: true, comment: true, createdAt: true, user: { select: { name: true } } },
          },
        },
      },
    },
  });

  if (!instructor) notFound();

  // Aggregate reviews across all events
  const allReviews = instructor.events.flatMap((e) => e.reviews);
  const avgRating =
    allReviews.length > 0
      ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
      : null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {instructor.name}
        </h1>
        {instructor.title && (
          <p className="text-slate-500">{instructor.title}</p>
        )}

        {/* Rating summary */}
        {avgRating !== null && (
          <div className="flex items-center gap-2 mt-1">
            <StarDisplay rating={Math.round(avgRating)} />
            <span className="text-sm font-semibold text-amber-600">
              {avgRating.toFixed(1)}
            </span>
            <span className="text-sm text-slate-400">
              ({allReviews.length} review{allReviews.length !== 1 ? "s" : ""})
            </span>
          </div>
        )}

        {instructor.bio && (
          <p className="mt-4 max-w-2xl text-slate-600 leading-relaxed">{instructor.bio}</p>
        )}
      </div>

      {/* Events */}
      <h2 className="mt-10 text-lg font-semibold text-slate-900">Published Events</h2>
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {instructor.events.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No published Events from this instructor yet.
          </p>
        )}
        {instructor.events.map((event) => (
          <div key={event.id} className="w-full sm:w-[calc(50%-0.5rem)]">
            <EventCard event={event} />
          </div>
        ))}
      </div>

      {/* Reviews section */}
      {allReviews.length > 0 && (
        <div className="mt-14">
          <h2 className="text-lg font-semibold text-slate-900">
            Student Reviews
            <span className="ml-2 text-sm font-normal text-slate-400">
              ({allReviews.length})
            </span>
          </h2>
          <div className="mt-4 flex flex-col gap-4">
            {allReviews.map((r, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">
                    {r.user.name ?? "Anonymous"}
                  </span>
                  <StarDisplay rating={r.rating} />
                </div>
                {r.comment && (
                  <p className="mt-2 text-sm text-slate-600">{r.comment}</p>
                )}
                <p className="mt-1 text-xs text-slate-400">
                  {r.createdAt.toLocaleDateString("en-GB", { dateStyle: "medium" })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
