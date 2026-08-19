import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/client";
import { sendNotification } from "@/lib/notifications";

// Runs every 5 minutes (docs/api.md §5.10). Reminds every CONFIRMED
// registrant of a Session starting within the configured window who hasn't
// already been reminded — an existence check per (user, session) rather
// than a DB unique constraint, so it stays correct regardless of exact
// cron cadence/drift, and so it never collides with unrelated
// notification types (see the comment on the Notification model).
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  const beforeMinutes = settings?.joinWindowBeforeMinutes ?? 20;
  const now = new Date();

  const dueSessions = await prisma.eventSession.findMany({
    where: {
      status: { in: ["SCHEDULED", "JOIN_OPEN"] },
      startAt: {
        gt: now,
        lte: new Date(now.getTime() + beforeMinutes * 60_000),
      },
    },
    include: { event: true },
  });

  let sent = 0;
  for (const session of dueSessions) {
    const registrations = await prisma.registration.findMany({
      where: { eventId: session.eventId, status: "CONFIRMED" },
      select: { userId: true },
    });

    for (const registration of registrations) {
      const already = await prisma.notification.findFirst({
        where: {
          userId: registration.userId,
          eventSessionId: session.id,
          type: "SESSION_REMINDER",
        },
      });
      if (already) continue;

      const startsAt = session.startAt.toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      });
      await sendNotification({
        userId: registration.userId,
        type: "SESSION_REMINDER",
        title: `Starting soon: ${session.title}`,
        body: `${session.event.title} — "${session.title}" starts at ${startsAt}.`,
        eventId: session.eventId,
        eventSessionId: session.id,
        email: {
          subject: `Reminder: ${session.title} starts soon`,
          text: `${session.event.title} — "${session.title}" starts at ${startsAt}. Join from your dashboard once it opens.`,
        },
      });
      sent += 1;
    }
  }

  return NextResponse.json({ sessionsChecked: dueSessions.length, remindersSent: sent });
}
