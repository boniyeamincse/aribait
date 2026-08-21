"use client";

import { useActionState } from "react";

import {
  updateInstructorEvent,
  deleteInstructorEvent,
  submitEventForApproval,
} from "@/lib/instructors/event-actions";
import type { Category, Event } from "@/lib/generated/prisma/client";
import { Button } from "@/components/ui/button";

import { InstructorEventForm } from "../../instructor-event-form";

type ActionResult = { ok: true } | { ok: false; error: string };

const EDITABLE_STATUSES = ["DRAFT", "CHANGES_REQUESTED"];

function SubmitForApprovalButton({ eventId }: { eventId: string }) {
  const [state, formAction, pending] = useActionState(
    async (): Promise<ActionResult> => submitEventForApproval(eventId),
    null,
  );

  return (
    <div className="flex flex-col gap-2">
      <form action={formAction}>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Submitting…" : "Submit for Approval"}
        </Button>
      </form>
      {state?.ok === false && <p className="text-sm text-destructive">{state.error}</p>}
    </div>
  );
}

export function OverviewTab({
  event,
  categories,
}: {
  event: Event;
  categories: Category[];
}) {
  const editable = EDITABLE_STATUSES.includes(event.status);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      {event.status === "REJECTED" && event.rejectionReason && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700">
          <p className="font-medium">Rejected</p>
          <p>{event.rejectionReason}</p>
        </div>
      )}
      {event.status === "CHANGES_REQUESTED" && event.changeRequestNote && (
        <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-4 text-sm text-orange-700">
          <p className="font-medium">Admin requested changes</p>
          <p>{event.changeRequestNote}</p>
        </div>
      )}
      {event.status === "PENDING_APPROVAL" && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700">
          Submitted — waiting for admin review.
        </div>
      )}

      {editable && (
        <div className="flex gap-2">
          <SubmitForApprovalButton eventId={event.id} />
          {event.status === "DRAFT" && (
            <form action={deleteInstructorEvent.bind(null, event.id)}>
              <Button type="submit" size="sm" variant="destructive">
                Delete Draft
              </Button>
            </form>
          )}
        </div>
      )}

      {editable ? (
        <InstructorEventForm
          action={updateInstructorEvent.bind(null, event.id)}
          categories={categories}
          submitLabel="Save changes"
          defaultValues={{
            title: event.title,
            shortDescription: event.shortDescription,
            description: event.description,
            type: event.type,
            categoryId: event.categoryId,
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
            termsAndRefundPolicy: event.termsAndRefundPolicy,
            classSchedule: event.classSchedule,
            minAttendanceSessions: event.minAttendanceSessions,
            deliveryMode: event.deliveryMode,
            location: event.location,
            skillLevel: event.skillLevel,
            promoVideoUrl: event.promoVideoUrl,
          }}
        />
      ) : (
        <p className="text-sm text-slate-500">
          This Event can&apos;t be edited while it&apos;s {event.status.replace(/_/g, " ").toLowerCase()}.
        </p>
      )}
    </div>
  );
}
