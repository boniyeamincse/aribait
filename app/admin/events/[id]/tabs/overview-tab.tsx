import {
  archiveEvent,
  cancelEvent,
  completeEvent,
  publishEvent,
  updateEvent,
} from "@/lib/events/actions";
import type { Category, Instructor, Prisma } from "@/lib/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { EventForm } from "../../event-form";
import { AttachCouponForm } from "../attach-coupon-form";
import { AnnouncementForm } from "../announcement-form";
import { ApprovalActions } from "../approval-actions";
import { RemoveResourceButton, ResourceForm } from "../resource-form";
import { ReviewModerationRow } from "../review-moderation";

type EventWithRelations = Prisma.EventGetPayload<{
  include: {
    discountEvents: { include: { discount: true } };
    resources: true;
    reviews: { include: { user: true } };
  };
}>;

export function OverviewTab({
  event,
  categories,
  instructors,
}: {
  event: EventWithRelations;
  categories: Category[];
  instructors: Instructor[];
}) {
  return (
    <div className="flex max-w-4xl flex-col gap-6 lg:flex-row lg:items-start">
      {/* Main Content Area */}
      <div className="flex flex-1 flex-col gap-6">
        
        {/* Status Alerts */}
        {event.status === "PENDING_APPROVAL" && (
          <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 shadow-sm">
            <p className="font-semibold text-amber-800">
              Action Required: Pending Review
            </p>
            <p className="text-sm text-amber-700">
              This Event was submitted by its instructor and is awaiting your review.
            </p>
            <div className="mt-2">
              <ApprovalActions eventId={event.id} />
            </div>
          </div>
        )}
        {event.status === "REJECTED" && event.rejectionReason && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-700 shadow-sm">
            <p className="font-semibold">Rejected</p>
            <p className="mt-1">{event.rejectionReason}</p>
          </div>
        )}
        {event.status === "CHANGES_REQUESTED" && event.changeRequestNote && (
          <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-5 text-sm text-orange-700 shadow-sm">
            <p className="font-semibold">Changes requested</p>
            <p className="mt-1">{event.changeRequestNote}</p>
          </div>
        )}

        {/* Edit Event Form */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 pb-4">
            <CardTitle className="text-lg">Event Details</CardTitle>
            <CardDescription>Update core information about this event.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <EventForm
              action={updateEvent.bind(null, event.id)}
              categories={categories}
              instructors={instructors}
              submitLabel="Save changes"
              defaultValues={{
                title: event.title,
                shortDescription: event.shortDescription,
                description: event.description,
                type: event.type,
                categoryId: event.categoryId,
                instructorId: event.instructorId,
                thumbnailUrl: event.thumbnailUrl,
                learningObjectives: event.learningObjectives,
                targetAudience: event.targetAudience,
                prerequisites: event.prerequisites,
                language: event.language,
                capacity: event.capacity,
                priceBdt: event.priceBdt,
                compareAtPriceBdt: event.compareAtPriceBdt,
                registrationOpensAt: event.registrationOpensAt,
                registrationClosesAt: event.registrationClosesAt,
                startAt: event.startAt,
                endAt: event.endAt,
                featured: event.featured,
                termsAndRefundPolicy: event.termsAndRefundPolicy,
                classSchedule: event.classSchedule,
                minAttendanceSessions: event.minAttendanceSessions,
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Sidebar Area */}
      <div className="flex w-full flex-col gap-6 lg:w-[340px] shrink-0">
        
        {/* Quick Actions */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 pb-4">
            <CardTitle className="text-base">Event Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col gap-3">
            {(event.status === "DRAFT" || event.status === "APPROVED") && (
              <form action={publishEvent.bind(null, event.id)}>
                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                  Publish Event
                </Button>
              </form>
            )}
            {event.status === "CANCELLED" && (
              <form action={publishEvent.bind(null, event.id)}>
                <Button type="submit" className="w-full">
                  Reactivate Event
                </Button>
              </form>
            )}
            {event.status !== "CANCELLED" && event.status !== "ARCHIVED" && (
              <form action={cancelEvent.bind(null, event.id)}>
                <Button type="submit" variant="destructive" className="w-full shadow-sm bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700">
                  Cancel Event
                </Button>
              </form>
            )}
            {event.status !== "ARCHIVED" && (
              <form action={archiveEvent.bind(null, event.id)}>
                <Button type="submit" variant="outline" className="w-full">
                  Archive Event
                </Button>
              </form>
            )}
            {event.status === "PUBLISHED" && (
              <form action={completeEvent.bind(null, event.id)}>
                <Button type="submit" variant="outline" className="w-full">
                  Mark as Completed
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Coupons */}
        {event.priceBdt > 0 && (
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50/50 pb-4">
              <CardTitle className="text-base">Coupons</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {event.discountEvents.length === 0 && (
                  <p className="text-sm text-slate-500 italic">No coupons attached.</p>
                )}
                {event.discountEvents.map((de) => (
                  <Badge key={de.id} variant="secondary" className="px-2 py-1 bg-indigo-50 text-indigo-700 border-indigo-200">
                    {de.discount.code}
                  </Badge>
                ))}
              </div>
              <AttachCouponForm eventId={event.id} />
            </CardContent>
          </Card>
        )}

        {/* Resources */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 pb-4">
            <CardTitle className="text-base">Resources</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              {event.resources.length === 0 && (
                <p className="text-sm text-slate-500 italic">No resources attached.</p>
              )}
              {event.resources.map((resource) => (
                <div key={resource.id} className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">{resource.title}</p>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate block mt-0.5">
                      {resource.url}
                    </a>
                  </div>
                  <RemoveResourceButton resourceId={resource.id} />
                </div>
              ))}
            </div>
            <ResourceForm eventId={event.id} />
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 pb-4">
            <CardTitle className="text-base">Reviews ({event.reviews.length})</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
              {event.reviews.length === 0 && (
                <p className="text-sm text-slate-500 italic">No reviews yet.</p>
              )}
              {event.reviews.map((review) => (
                <div key={review.id} className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900 truncate">{review.user.name}</p>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 shrink-0">
                      ⭐ {review.rating}/5
                    </Badge>
                  </div>
                  {review.comment && <p className="text-slate-600 line-clamp-3 leading-snug">{review.comment}</p>}
                  <div className="mt-1 pt-2 border-t border-slate-200">
                    <ReviewModerationRow reviewId={review.id} published={review.published} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 pb-4">
            <CardTitle className="text-base">Announcements</CardTitle>
            <CardDescription className="text-xs">
              Sends an email to all confirmed/waitlisted students.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <AnnouncementForm eventId={event.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
