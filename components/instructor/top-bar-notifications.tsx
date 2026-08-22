"use client";

import { Bell } from "lucide-react";
import Link from "next/link";

export function TopBarNotifications({ unreadCount }: { unreadCount: number }) {
  return (
    <Link
      href="/instructor/notifications"
      className="relative flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900"
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute right-0.5 top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
