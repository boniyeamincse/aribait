"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays } from "lucide-react";

const NAV_ITEMS = [
  { href: "/instructor", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/instructor/events", label: "My Events", icon: CalendarDays },
];

export function InstructorNav() {
  const pathname = usePathname();

  return (
    <nav className="flex w-64 shrink-0 flex-col gap-0.5 overflow-y-auto border-r border-slate-200 bg-slate-50 p-4">
      {NAV_ITEMS.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              isActive
                ? "flex items-center gap-3 rounded-lg border border-green-500/20 bg-gradient-to-r from-green-500/15 to-blue-500/10 px-3 py-2.5 text-sm font-medium text-slate-900"
                : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-500 transition-colors hover:bg-slate-100/60 hover:text-slate-800"
            }
          >
            <Icon size={16} className={isActive ? "text-green-400" : "text-slate-600"} strokeWidth={isActive ? 2 : 1.75} />
            <span className="flex-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
