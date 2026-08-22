"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Calendar,
  Plus,
  FileText,
  Send,
  CheckCircle,
  MonitorPlay,
  GraduationCap,
  CheckSquare,
  FolderOpen,
  Bell,
  UserCog,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

type NavGroup = {
  label: string | null;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [{ href: "/instructor", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "My Events",
    items: [
      { href: "/instructor/events", label: "All Events", icon: CalendarDays, exact: true },
      { href: "/instructor/events/new", label: "Create Event", icon: Plus, exact: true },
      { href: "/instructor/events?status=DRAFT", label: "Drafts", icon: FileText },
      { href: "/instructor/events?status=PENDING_APPROVAL", label: "Pending Approval", icon: Send },
      { href: "/instructor/events?status=PUBLISHED", label: "Published", icon: CheckCircle },
    ],
  },
  {
    label: null,
    items: [
      { href: "/instructor/calendar", label: "Calendar", icon: Calendar, exact: true },
      { href: "/instructor/sessions", label: "Sessions", icon: MonitorPlay, exact: true },
      { href: "/instructor/students", label: "Students", icon: GraduationCap, exact: true },
      { href: "/instructor/attendance", label: "Attendance", icon: CheckSquare, exact: true },
      { href: "/instructor/materials", label: "Materials", icon: FolderOpen, exact: true },
      { href: "/instructor/notifications", label: "Notifications", icon: Bell, exact: true },
      { href: "/instructor/profile", label: "Profile", icon: UserCog, exact: true },
    ],
  },
];

export function InstructorNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isActive = (item: NavItem) => {
    const [itemPath, itemQuery] = item.href.split("?");
    if (pathname !== itemPath) {
      return !item.exact && pathname.startsWith(`${itemPath}/`);
    }
    if (!itemQuery) {
      return !searchParams.get("status");
    }
    return new URLSearchParams(itemQuery).get("status") === searchParams.get("status");
  };

  return (
    <nav className="flex w-64 shrink-0 flex-col gap-4 overflow-y-auto border-r border-slate-200 bg-slate-50 p-4">
      {NAV_GROUPS.map((group, i) => (
        <div key={group.label ?? `group-${i}`} className="flex flex-col gap-0.5">
          {group.label && (
            <span className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              {group.label}
            </span>
          )}
          {group.items.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "flex items-center gap-3 rounded-lg border border-green-500/20 bg-gradient-to-r from-green-500/15 to-blue-500/10 px-3 py-2.5 text-sm font-medium text-slate-900"
                    : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-500 transition-colors hover:bg-slate-100/60 hover:text-slate-800"
                }
              >
                <Icon size={16} className={active ? "text-green-400" : "text-slate-600"} strokeWidth={active ? 2 : 1.75} />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
