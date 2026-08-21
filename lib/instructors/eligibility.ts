import type { Instructor } from "@/lib/generated/prisma/client";

export const INELIGIBLE_MESSAGE =
  "Your instructor profile must be verified before you can create an event.";

/**
 * Event-creation eligibility gate (docs/instactor.md §1). Distinct from
 * requireInstructor() in lib/permissions — an instructor can still see
 * their own dashboard/profile while ineligible; this only gates the
 * create/submit-an-event actions and pages.
 */
export function isEligibleToCreateEvents(
  user: { status: string },
  instructor: Pick<Instructor, "verificationStatus" | "suspended" | "name" | "title" | "bio" | "email" | "phone">,
): boolean {
  return (
    user.status === "ACTIVE" &&
    instructor.verificationStatus === "VERIFIED" &&
    !instructor.suspended &&
    !!instructor.name &&
    !!instructor.title &&
    !!instructor.bio &&
    !!instructor.email &&
    !!instructor.phone
  );
}
