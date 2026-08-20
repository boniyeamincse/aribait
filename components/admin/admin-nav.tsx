"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Laptop,
  UserCog,
  BarChart3,
  Database,
  ShieldCheck,
  ArrowRightLeft,
  ClipboardList,
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
    items: [
      { href: "/admin",                 label: "Dashboard",          icon: LayoutDashboard, exact: true },
      { href: "/admin/service-records", label: "Service Records",    icon: FileText },
      { href: "/admin/employees",       label: "Employee Directory", icon: Users },
      { href: "/admin/devices",         label: "Device Records",     icon: Laptop },
      { href: "/admin/engineers",       label: "Engineers",          icon: UserCog },
      { href: "/admin/reports",         label: "Reports",            icon: BarChart3 },
      { href: "/admin/master-data",     label: "Master Data",        icon: Database },
      { href: "/admin/users",           label: "User Management",    icon: ShieldCheck },
      { href: "/admin/import-export",   label: "Import & Export",    icon: ArrowRightLeft },
      { href: "/admin/audit-logs",      label: "Audit Logs",         icon: ClipboardList },
      { href: "/admin/settings",        label: "System Settings",    icon: Settings },
    ],
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
    <nav className="flex w-64 shrink-0 flex-col gap-5 overflow-y-auto border-r border-slate-200 bg-slate-50 p-4">
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
                    ? "flex items-center gap-3 rounded-lg border border-green-500/20 bg-gradient-to-r from-green-500/15 to-blue-500/10 px-3 py-2.5 text-sm font-medium text-slate-900"
                    : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-500 transition-colors hover:bg-slate-100/60 hover:text-slate-800"
                }
              >
                <Icon
                  size={16}
                  className={isActive ? "text-green-400" : "text-slate-600"}
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
