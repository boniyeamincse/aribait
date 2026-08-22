import Link from "next/link";

import { requireInstructor } from "@/lib/permissions";
import { isEligibleToCreateEvents, INELIGIBLE_MESSAGE } from "@/lib/instructors/eligibility";
import { prisma } from "@/lib/db/client";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";

export default async function InstructorDashboardPage() {
  const { user, instructor } = await requireInstructor();
  const eligible = isEligibleToCreateEvents(user, instructor);

  const [statusCounts, upcomingSessions] = await Promise.all([
    prisma.event.groupBy({
      by: ["status"],
      where: { instructorId: instructor.id },
      _count: true,
    }),
    prisma.eventSession.findMany({
      where: {
        hostInstructorId: instructor.id,
        status: { not: "CANCELLED" },
        startAt: { gte: new Date() },
      },
      orderBy: { startAt: "asc" },
      take: 5,
      include: { event: { select: { title: true } } },
    }),
  ]);

  const countFor = (status: string) =>
    statusCounts.find((c) => c.status === status)?._count ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title={`Welcome, ${user.name ?? "Instructor"}`}
        description="Your Events, Sessions, and students."
        actions={
          eligible ? (
            <Button render={<Link href="/instructor/events/new">Create Event</Link>} nativeButton={false} />
          ) : undefined
        }
      />

      {!eligible && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700">
          {INELIGIBLE_MESSAGE}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Drafts", status: "DRAFT" },
          { label: "Pending Approval", status: "PENDING_APPROVAL" },
          { label: "Published", status: "PUBLISHED" },
          { label: "Needs Changes", status: "CHANGES_REQUESTED" },
        ].map((card) => (
          <div key={card.status} className="rounded-2xl border border-slate-200 bg-white p-5">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              {card.label}
            </span>
            <p className="mt-2 text-2xl font-bold text-slate-900">{countFor(card.status)}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Upcoming Sessions</h2>
          <Link href="/instructor/calendar" className="text-sm font-medium text-indigo-600 hover:underline">
            See Calendar →
          </Link>
        </div>
        <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {upcomingSessions.length === 0 && (
            <p className="p-4 text-sm text-slate-500">No upcoming Sessions.</p>
          )}
          {upcomingSessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-4 p-4 text-sm">
              <div>
                <p className="font-medium text-slate-900">
                  {s.event.title} — {s.title}
                </p>
                <p className="text-slate-500">
                  {s.startAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
