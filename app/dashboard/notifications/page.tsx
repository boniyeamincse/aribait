import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/permissions";
import { cn } from "@/lib/utils";

import { MarkReadButton } from "./mark-read-button";
import { MarkAllReadButton } from "./mark-all-read-button";

export default async function MyNotificationsPage() {
  const user = await requireUser();

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const hasUnread = notifications.some((n) => !n.readAt);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        {hasUnread && <MarkAllReadButton />}
      </div>

      <div className="mt-6 divide-y rounded-lg border">
        {notifications.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">
            No notifications yet.
          </p>
        )}
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "flex items-center justify-between gap-4 p-4 text-sm",
              !notification.readAt && "bg-accent/40",
            )}
          >
            <div>
              <p className={cn("font-medium", !notification.readAt && "font-semibold")}>
                {notification.title}
              </p>
              <p className="text-muted-foreground">{notification.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {notification.createdAt.toLocaleString("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
            {!notification.readAt && (
              <MarkReadButton notificationId={notification.id} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
