"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";

import { submitReview } from "@/lib/reviews/actions";

export function StarReviewForm({
  eventId,
  eventTitle,
  existing,
}: {
  eventId: string;
  eventTitle: string;
  existing?: { rating: number; comment: string | null; published: boolean } | null;
}) {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (submitted) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        <span>✅</span>
        <span>
          Review submitted! It will appear after admin approval.
        </span>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }
    const fd = new FormData();
    fd.set("rating", String(rating));
    fd.set("comment", comment);

    startTransition(async () => {
      const result = await submitReview(eventId, null, fd);
      if (result.ok) {
        setSubmitted(true);
        toast.success("Review submitted — thank you!");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
        Rate this event
      </p>

      {/* Star selector */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110 active:scale-95"
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              size={24}
              className={`transition-colors ${
                star <= (hovered || rating)
                  ? "fill-amber-400 text-amber-400"
                  : "fill-slate-200 text-slate-200"
              }`}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-xs font-medium text-amber-600">
            {["", "Poor", "Fair", "Good", "Very good", "Excellent"][rating]}
          </span>
        )}
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience (optional)…"
        rows={2}
        className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none"
      />

      <div className="flex items-center justify-between">
        {existing && (
          <span className="text-xs text-slate-400">
            {existing.published ? "✅ Published" : "⏳ Awaiting approval"}
          </span>
        )}
        <button
          type="submit"
          disabled={isPending || rating === 0}
          className="ml-auto rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
        >
          {isPending ? "Saving…" : existing ? "Update review" : "Submit review"}
        </button>
      </div>
    </form>
  );
}
