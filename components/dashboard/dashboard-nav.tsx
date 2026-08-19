"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: "🏠" },
  { href: "/dashboard/events", label: "My Events", icon: "📅" },
  { href: "/dashboard/sessions", label: "Sessions", icon: "🔴" },
  { href: "/dashboard/attendance", label: "Attendance", icon: "✅" },
  { href: "/dashboard/certificates", label: "Certificates", icon: "🏆" },
  { href: "/dashboard/payments", label: "Payments", icon: "💳" },
  { href: "/dashboard/notifications", label: "Notifications", icon: "🔔" },
  { href: "/dashboard/profile", label: "Profile", icon: "👤" },
];

export function DashboardNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  if (mobile) {
    // Horizontal scrollable tabs for mobile
    return (
      <nav className="flex gap-1 pb-3">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-blue-500/20 to-green-500/10 text-slate-900 border border-blue-500/30"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  // Vertical sidebar for desktop
  return (
    <nav className="flex w-56 shrink-0 flex-col gap-1 border-r border-slate-200 bg-slate-50 p-4">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
              isActive
                ? "bg-gradient-to-r from-blue-500/15 to-green-500/10 text-slate-900 border border-blue-500/20"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
