import { notFound, redirect } from "next/navigation";
import Link from "next/link";

import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/permissions";
import { decryptSecret } from "@/lib/security/crypto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Protected join redirect (docs/api.md §3, docs/security.md §4). Every check
// runs server-side; the meeting URL is decrypted only in this handler, right
// before the redirect, and never sent to the client as page data.
export default async function JoinSessionPage({
  params,
}: PageProps<"/dashboard/sessions/[sessionId]/join">) {
  const { sessionId } = await params;
  const user = await requireUser();

  const session = await prisma.eventSession.findUnique({
    where: { id: sessionId },
    include: { event: true },
  });
  if (!session) notFound();

  const registration = await prisma.registration.findUnique({
    where: { userId_eventId: { userId: user.id, eventId: session.eventId } },
  });

  const error = await validateJoin(session, registration);
  if (error) {
    return (
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Can&apos;t join yet</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <p className="text-destructive">{error}</p>
          <Link
            href={`/events/${session.event.slug}`}
            className="underline underline-offset-4"
          >
            Back to Event
          </Link>
        </CardContent>
      </Card>
    );
  }

  await prisma.sessionAttendance.upsert({
    where: {
      registrationId_eventSessionId: {
        registrationId: registration!.id,
        eventSessionId: session.id,
      },
    },
    update: { joinedAt: new Date() },
    create: {
      registrationId: registration!.id,
      eventSessionId: session.id,
      joinedAt: new Date(),
    },
  });

  redirect(decryptSecret(session.meetingUrl!));
}

async function validateJoin(
  session: { status: string; startAt: Date; endAt: Date; meetingUrl: string | null },
  registration: { status: string } | null,
) {
  if (!registration || registration.status !== "CONFIRMED") {
    return "You don't have a confirmed registration for this Event.";
  }
  if (session.status === "CANCELLED") {
    return "This Session has been cancelled.";
  }
  if (!session.meetingUrl) {
    return "The meeting link hasn't been configured for this Session yet.";
  }

  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  const beforeMinutes = settings?.joinWindowBeforeMinutes ?? 20;
  const afterMinutes = settings?.joinWindowAfterMinutes ?? 15;
  const opensAt = new Date(session.startAt.getTime() - beforeMinutes * 60_000);
  const closesAt = new Date(session.endAt.getTime() + afterMinutes * 60_000);
  const now = new Date();

  if (now < opensAt) {
    return `Join opens at ${opensAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}.`;
  }
  if (now > closesAt) {
    return "The join window for this Session has closed.";
  }

  return null;
}
