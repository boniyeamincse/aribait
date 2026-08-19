import Link from "next/link";

import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { formatBdt } from "@/lib/utils";

import { CancelRegistrationButton } from "./cancel-registration-button";

export default async function MyEventsPage() {
  const user = await requireUser();

  const registrations = await prisma.registration.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { event: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">My Events</h1>
      <div className="mt-6 divide-y rounded-lg border">
        {registrations.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">
            You haven&apos;t registered for any Events yet.{" "}
            <Link href="/events" className="underline underline-offset-4">
              Browse Events
            </Link>
            .
          </p>
        )}
        {registrations.map((registration) => (
          <div
            key={registration.id}
            className="flex items-center justify-between gap-4 p-4 text-sm"
          >
            <div>
              <Link
                href={`/events/${registration.event.slug}`}
                className="font-medium underline-offset-4 hover:underline"
              >
                {registration.event.title}
              </Link>
              <p className="text-muted-foreground">
                {formatBdt(registration.event.priceBdt)} ·{" "}
                {registration.event.startAt.toLocaleDateString("en-GB", {
                  dateStyle: "medium",
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{registration.status}</Badge>
              {(registration.status === "CONFIRMED" ||
                registration.status === "WAITLISTED") && (
                <CancelRegistrationButton registrationId={registration.id} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
