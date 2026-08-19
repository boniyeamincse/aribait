import Link from "next/link";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/events", label: "My Events" },
  { href: "/dashboard/sessions", label: "My Sessions" },
  { href: "/dashboard/attendance", label: "Attendance" },
  { href: "/dashboard/certificates", label: "Certificates" },
  { href: "/dashboard/payments", label: "Payments and Receipts" },
  { href: "/dashboard/notifications", label: "Notifications" },
  { href: "/dashboard/profile", label: "Profile" },
];

export function DashboardNav() {
  return (
    <nav className="flex w-56 shrink-0 flex-col gap-1 border-r p-4">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
