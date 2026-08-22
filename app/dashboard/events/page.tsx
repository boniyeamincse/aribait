import Link from "next/link";
import { BookOpen, User, CalendarDays, Receipt, ArrowRight, Sparkles } from "lucide-react";

import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { formatBdt } from "@/lib/utils";

import { CancelRegistrationButton } from "./cancel-registration-button";
import { StarReviewForm } from "./review-form";

export default async function MyEventsPage() {
  const user = await requireUser();

  const [registrations, reviews] = await Promise.all([
    prisma.registration.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { event: { include: { instructor: { select: { name: true } } } } },
    }),
    prisma.review.findMany({ where: { userId: user.id } }),
  ]);
  const reviewByEventId = new Map(reviews.map((r) => [r.eventId, r]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 shadow-inner">
          <BookOpen size={20} />
        </div>
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">
          My Courses
        </h1>
      </div>
      <div className="flex flex-col gap-5">
        {registrations.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-white/50 backdrop-blur-md py-16 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 mb-5 shadow-inner">
              <BookOpen size={28} className="text-indigo-400" />
            </div>
            <p className="text-lg font-bold text-slate-800">No courses yet</p>
            <p className="text-sm text-slate-500 mt-1 mb-6">You haven&apos;t registered for any courses yet.</p>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-105 transition-all"
            >
              Browse Courses <ArrowRight size={16} />
            </Link>
          </div>
        )}
        {registrations.map((registration) => (
          <div
            key={registration.id}
            className="group relative flex flex-col gap-4 rounded-[1.5rem] border border-white/60 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 hover:bg-white/80"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
              <div className="flex gap-4 items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300 mt-1">
                  <BookOpen size={20} />
                </div>
                <div>
                  <Link
                    href={`/events/${registration.event.slug}`}
                    className="text-lg font-bold text-slate-900 transition-colors hover:text-indigo-600"
                  >
                    {registration.event.title}
                  </Link>
                  <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1.5 bg-white/80 border border-slate-100 px-2.5 py-1.5 rounded-lg text-slate-700 shadow-sm backdrop-blur-sm">
                      <User size={14} className="text-indigo-400" />
                      {registration.event.instructor.name}
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/80 border border-slate-100 px-2.5 py-1.5 rounded-lg text-slate-700 shadow-sm backdrop-blur-sm">
                      <Receipt size={14} className="text-emerald-500" />
                      {formatBdt(registration.event.priceBdt)}
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/80 border border-slate-100 px-2.5 py-1.5 rounded-lg text-slate-700 shadow-sm backdrop-blur-sm">
                      <CalendarDays size={14} className="text-purple-400" />
                      {registration.event.startAt.toLocaleDateString("en-GB", {
                        dateStyle: "medium",
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3 self-end sm:self-start sm:mt-1">
                <Badge variant="secondary" className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg border-white/60 bg-white shadow-sm backdrop-blur-md">
                  {registration.status}
                </Badge>
                {(registration.status === "CONFIRMED" ||
                  registration.status === "WAITLISTED") && (
                  <CancelRegistrationButton registrationId={registration.id} />
                )}
              </div>
            </div>

            {/* Review — available after CONFIRMED or COMPLETED */}
            {(registration.status === "CONFIRMED" ||
              registration.status === "COMPLETED") && (
              <div className="mt-2 pt-5 border-t border-slate-200/50">
                <StarReviewForm
                  eventId={registration.eventId}
                  eventTitle={registration.event.title}
                  existing={reviewByEventId.get(registration.eventId) ?? null}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
