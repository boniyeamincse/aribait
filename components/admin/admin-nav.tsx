"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  MonitorPlay,
  Tag,
  UserCog,
  GraduationCap,
  ClipboardList,
  CreditCard,
  Ticket,
  CheckSquare,
  Award,
  Bell,
  BarChart3,
  ShieldCheck,
  Settings,
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: string;
};

type NavGroup = {
  label: string | null;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [{ href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/events",      label: "Events",      icon: CalendarDays },
      { href: "/admin/sessions",    label: "Sessions",    icon: MonitorPlay  },
      { href: "/admin/categories",  label: "Categories",  icon: Tag          },
      { href: "/admin/instructors", label: "Instructors", icon: UserCog      },
    ],
  },
  {
    label: "Students",
    items: [
      { href: "/admin/students",      label: "Students",      icon: GraduationCap },
      { href: "/admin/registrations", label: "Registrations", icon: ClipboardList },
    ],
  },
  {
    label: "Commerce",
    items: [
      { href: "/admin/payments",  label: "Payments", icon: CreditCard, badge: "pendingPayments" },
      { href: "/admin/discounts", label: "Coupons",  icon: Ticket },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/admin/attendance",    label: "Attendance",    icon: CheckSquare },
      { href: "/admin/certificates",  label: "Certificates",  icon: Award       },
      { href: "/admin/notifications", label: "Notifications", icon: Bell        },
    ],
  },
  {
    label: "Analytics",
    items: [
      { href: "/admin/reports",    label: "Reports",    icon: BarChart3   },
      { href: "/admin/audit-logs", label: "Audit Logs", icon: ShieldCheck },
    ],
  },
  {
    label: "System",
    items: [{ href: "/admin/settings", label: "Settings", icon: Settings }],
  },
];

export function AdminNav({
  pendingPaymentsCount = 0,
  onNavigate,
}: {
  pendingPaymentsCount?: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const badgeValues: Record<string, number> = { pendingPayments: pendingPaymentsCount };

  return (
    <nav className="flex w-64 shrink-0 flex-col gap-5 overflow-y-auto border-r border-slate-800 bg-slate-950 p-4">
      {NAV_GROUPS.map((group, i) => (
        <div key={group.label ?? `group-${i}`} className="flex flex-col gap-0.5">
          {group.label && (
            <span className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              {group.label}
            </span>
          )}
          {group.items.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const badgeCount = item.badge ? badgeValues[item.badge] : undefined;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={
                  isActive
                    ? "flex items-center gap-3 rounded-lg border border-violet-500/20 bg-gradient-to-r from-violet-500/15 to-cyan-500/10 px-3 py-2.5 text-sm font-medium text-white"
                    : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-500 transition-colors hover:bg-slate-800/60 hover:text-slate-200"
                }
              >
                <Icon
                  size={16}
                  className={isActive ? "text-violet-400" : "text-slate-600"}
                  strokeWidth={isActive ? 2 : 1.75}
                />
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
