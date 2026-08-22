import { prisma } from "@/lib/db/client";
import { requireInstructor } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { Bell, BellRing, Clock } from "lucide-react";

import { MarkReadButton } from "@/app/dashboard/notifications/mark-read-button";
import { MarkAllReadButton } from "@/app/dashboard/notifications/mark-all-read-button";

export default async function InstructorNotificationsPage() {
  const { user } = await requireInstructor();

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const hasUnread = notifications.some((n) => !n.readAt);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      {/* Premium Header Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Notifications Center</h1>
          <p className="text-sm font-medium text-slate-500">
            Stay updated with system alerts, session updates, and student activities.
          </p>
        </div>
        {hasUnread && (
          <div className="shrink-0">
            <MarkAllReadButton />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200 border-dashed bg-slate-50/50 p-12 text-center text-slate-500">
            <Bell size={32} className="text-slate-300" />
            <p className="font-medium text-slate-500">You're all caught up! No notifications yet.</p>
          </div>
        )}
        
        {notifications.map((notification) => {
          const isUnread = !notification.readAt;
          return (
            <div
              key={notification.id}
              className={cn(
                "group relative flex flex-col sm:flex-row sm:items-start justify-between gap-4 rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5",
                isUnread ? "border-indigo-200 bg-indigo-50/30" : "border-slate-200"
              )}
            >
              {/* Highlight bar for unread */}
              {isUnread && (
                <div className="absolute left-0 top-0 h-full w-1.5 rounded-l-2xl bg-indigo-500" />
              )}
              
              <div className="flex items-start gap-4">
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border mt-0.5",
                  isUnread ? "bg-indigo-100 border-indigo-200 text-indigo-600" : "bg-slate-100 border-slate-200 text-slate-400 group-hover:text-slate-500"
                )}>
                  {isUnread ? <BellRing size={18} className="animate-pulse" /> : <Bell size={18} />}
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <h3 className={cn(
                    "text-base tracking-tight",
                    isUnread ? "font-black text-slate-900 group-hover:text-indigo-700" : "font-semibold text-slate-700"
                  )}>
                    {notification.title}
                  </h3>
                  <p className={cn(
                    "text-sm leading-relaxed",
                    isUnread ? "font-medium text-slate-700" : "text-slate-500"
                  )}>
                    {notification.body}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                    <Clock size={12} />
                    {notification.createdAt.toLocaleString("en-GB", { 
                      day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" 
                    })}
                  </div>
                </div>
              </div>

              {isUnread && (
                <div className="shrink-0 sm:self-center ml-14 sm:ml-0">
                  <MarkReadButton notificationId={notification.id} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
