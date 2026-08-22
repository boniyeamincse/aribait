import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { Bell, Info, Clock, CheckCircle2, CircleDot, BellRing } from "lucide-react";

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
    <div className="flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-100 text-fuchsia-600 shadow-inner relative">
            <Bell size={20} />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-fuchsia-500 border-2 border-white"></span>
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">
            Notifications
          </h1>
        </div>
        {hasUnread && <MarkAllReadButton />}
      </div>
      <div className="flex items-start gap-3 rounded-2xl bg-indigo-50/50 border border-indigo-100 p-4 backdrop-blur-sm mb-6 mt-4">
        <Info size={20} className="text-indigo-500 shrink-0 mt-0.5" />
        <p className="text-sm text-indigo-900 leading-relaxed font-medium">
          Stay updated with important announcements, payment confirmations, and upcoming live session alerts.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-white/50 backdrop-blur-md py-16 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-fuchsia-50 mb-5 shadow-inner">
              <Bell size={28} className="text-fuchsia-400" />
            </div>
            <p className="text-lg font-bold text-slate-800">No notifications yet</p>
            <p className="text-sm text-slate-500 mt-1">You are all caught up! We&apos;ll notify you when something important happens.</p>
          </div>
        )}
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "group relative flex flex-col sm:flex-row sm:items-start justify-between gap-5 rounded-[1.5rem] border p-5 sm:p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
              notification.readAt
                ? "border-white/60 bg-white/60 hover:shadow-slate-500/10 hover:bg-white/80"
                : "border-fuchsia-200 bg-fuchsia-50/60 hover:shadow-fuchsia-500/10 hover:bg-fuchsia-50/90"
            )}
          >
            <div className="flex gap-4 items-start">
              <div className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-inner group-hover:scale-110 transition-transform duration-300 mt-1",
                notification.readAt ? "bg-slate-100 text-slate-400" : "bg-gradient-to-br from-fuchsia-400 to-purple-600 text-white shadow-md shadow-fuchsia-500/20"
              )}>
                {notification.readAt ? <Bell size={20} /> : <BellRing size={20} className="animate-pulse" />}
              </div>
              <div>
                <p className={cn("text-lg transition-colors", notification.readAt ? "font-semibold text-slate-700" : "font-bold text-slate-900 group-hover:text-fuchsia-700")}>
                  {notification.title}
                </p>
                <p className={cn("mt-1 text-sm leading-relaxed", notification.readAt ? "text-slate-500" : "text-slate-700 font-medium")}>
                  {notification.body}
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Clock size={14} className={notification.readAt ? "text-slate-400" : "text-fuchsia-500"} />
                  {notification.createdAt.toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
              </div>
            </div>
            {!notification.readAt && (
              <div className="self-end sm:self-center shrink-0 mt-2 sm:mt-0">
                <MarkReadButton notificationId={notification.id} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
