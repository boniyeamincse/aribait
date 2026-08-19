import { prisma } from "@/lib/db/client";
import type { NotificationType } from "@/lib/generated/prisma/client";

import { sendEmail } from "./email";

/**
 * Always writes the in-app Notification row; also emails when `email` is
 * given. Not a Server Action — called from server actions and cron routes.
 */
export async function sendNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  eventId?: string;
  eventSessionId?: string;
  email?: { subject: string; text: string };
}) {
  await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      eventId: params.eventId,
      eventSessionId: params.eventSessionId,
    },
  });

  if (params.email) {
    const user = await prisma.user.findUnique({ where: { id: params.userId } });
    if (user) {
      await sendEmail({
        to: user.email,
        subject: params.email.subject,
        text: params.email.text,
      });
    }
  }
}

/** Sends the same notification to every given user. */
export async function sendNotificationToMany(
  userIds: string[],
  build: (userId: string) => Parameters<typeof sendNotification>[0],
) {
  for (const userId of userIds) {
    await sendNotification(build(userId));
  }
}
