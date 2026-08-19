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
import { Separator } from "@/components/ui/separator";

import { EventForm } from "../../event-form";
import { AttachCouponForm } from "../attach-coupon-form";
import { AnnouncementForm } from "../announcement-form";
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
    <div className="flex max-w-2xl flex-col gap-8">
      <div className="flex gap-2">
        {event.status === "DRAFT" && (
          <form action={publishEvent.bind(null, event.id)}>
            <Button type="submit" size="sm">
              Publish
            </Button>
          </form>
        )}
        {event.status !== "CANCELLED" && event.status !== "ARCHIVED" && (
          <form action={cancelEvent.bind(null, event.id)}>
            <Button type="submit" size="sm" variant="destructive">
              Cancel Event
            </Button>
          </form>
        )}
        {event.status !== "ARCHIVED" && (
          <form action={archiveEvent.bind(null, event.id)}>
            <Button type="submit" size="sm" variant="outline">
              Archive
            </Button>
          </form>
        )}
        {event.status === "PUBLISHED" && (
          <form action={completeEvent.bind(null, event.id)}>
            <Button type="submit" size="sm" variant="outline">
              Complete Event
            </Button>
          </form>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-medium text-slate-900">Edit Event</h2>
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
      </div>

      {event.priceBdt > 0 && (
        <>
          <Separator />
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-medium text-slate-900">Coupons</h2>
            <div className="flex flex-wrap gap-2">
              {event.discountEvents.length === 0 && (
                <p className="text-sm text-slate-500">No coupons attached to this Event.</p>
              )}
              {event.discountEvents.map((de) => (
                <Badge key={de.id} variant="secondary">
                  {de.discount.code}
                </Badge>
              ))}
            </div>
            <AttachCouponForm eventId={event.id} />
          </div>
        </>
      )}

      <Separator />

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-medium text-slate-900">Resources</h2>
        <div className="divide-y divide-slate-200 rounded-lg border border-slate-200">
          {event.resources.length === 0 && (
            <p className="p-4 text-sm text-slate-500">No resources attached to this Event.</p>
          )}
          {event.resources.map((resource) => (
            <div key={resource.id} className="flex items-center justify-between gap-4 p-3 text-sm">
              <div>
                <p className="font-medium text-slate-900">{resource.title}</p>
                <p className="truncate text-slate-500">{resource.url}</p>
              </div>
              <RemoveResourceButton resourceId={resource.id} />
            </div>
          ))}
        </div>
        <ResourceForm eventId={event.id} />
      </div>

      <Separator />

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-medium text-slate-900">Reviews</h2>
        <div className="divide-y divide-slate-200 rounded-lg border border-slate-200">
          {event.reviews.length === 0 && (
            <p className="p-4 text-sm text-slate-500">No reviews submitted yet.</p>
          )}
          {event.reviews.map((review) => (
            <div key={review.id} className="flex items-center justify-between gap-4 p-3 text-sm">
              <div>
                <p className="font-medium text-slate-900">
                  {review.user.name} — {review.rating}/5
                </p>
                {review.comment && <p className="text-slate-500">{review.comment}</p>}
              </div>
              <ReviewModerationRow reviewId={review.id} published={review.published} />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-medium text-slate-900">Announcements</h2>
        <p className="text-sm text-slate-500">
          Sends an in-app + email notification to every confirmed and waitlisted registrant.
        </p>
        <AnnouncementForm eventId={event.id} />
      </div>
    </div>
  );
}
