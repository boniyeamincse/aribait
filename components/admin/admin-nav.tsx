import Link from "next/link";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/sessions", label: "Sessions" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/instructors", label: "Instructors" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/registrations", label: "Registrations" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/discounts", label: "Discounts and Coupons" },
  { href: "/admin/attendance", label: "Attendance" },
  { href: "/admin/certificates", label: "Certificates" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/audit-logs", label: "Audit Logs" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav() {
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
