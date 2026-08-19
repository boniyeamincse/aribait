"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_GROUPS = [
  {
    label: null,
    items: [{ href: "/admin", label: "Overview", icon: "🏠", exact: true }],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/events", label: "Events", icon: "📅" },
      { href: "/admin/sessions", label: "Sessions", icon: "🔴" },
      { href: "/admin/categories", label: "Categories", icon: "🗂️" },
      { href: "/admin/instructors", label: "Instructors", icon: "👨‍🏫" },
    ],
  },
  {
    label: "Students",
    items: [
      { href: "/admin/students", label: "Students", icon: "🎓" },
      { href: "/admin/registrations", label: "Registrations", icon: "📋" },
    ],
  },
  {
    label: "Commerce",
    items: [
      { href: "/admin/payments", label: "Payments", icon: "💳", badge: "pendingPayments" },
      { href: "/admin/discounts", label: "Coupons", icon: "🏷️" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/admin/attendance", label: "Attendance", icon: "✅" },
      { href: "/admin/certificates", label: "Certificates", icon: "🏆" },
      { href: "/admin/notifications", label: "Notifications", icon: "🔔" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { href: "/admin/reports", label: "Reports", icon: "📊" },
      { href: "/admin/audit-logs", label: "Audit Logs", icon: "🔍" },
    ],
  },
  {
    label: "System",
    items: [{ href: "/admin/settings", label: "Settings", icon: "⚙️" }],
  },
] as const;

export function AdminNav({
  pendingPaymentsCount = 0,
  onNavigate,
}: {
  pendingPaymentsCount?: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const badgeValues: Record<string, number> = {
    pendingPayments: pendingPaymentsCount,
  };

  return (
    <nav className="flex w-64 shrink-0 flex-col gap-5 overflow-y-auto p-4">
      {NAV_GROUPS.map((group, i) => (
        <div key={group.label ?? `group-${i}`} className="flex flex-col gap-1">
          {group.label && (
            <span className="px-3 pb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
              {group.label}
            </span>
          )}
          {group.items.map((item) => {
            const isActive = "exact" in item && item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const badgeCount = "badge" in item ? badgeValues[item.badge] : undefined;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={
                  isActive
                    ? "flex items-center gap-2.5 rounded-lg border border-violet-500/20 bg-gradient-to-r from-violet-500/15 to-cyan-500/10 px-3 py-2 text-sm font-medium text-white"
                    : "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-white"
                }
              >
                <span aria-hidden="true">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {!!badgeCount && (
                  <span className="rounded-full bg-red-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-red-400">
                    {badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
