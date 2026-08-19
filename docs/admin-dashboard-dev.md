# Ariba IT — Admin Dashboard Development Guide

**Document type:** Step-by-step implementation guide  
**Related:** [admin-dashboard-idea.md](./admin-dashboard-idea.md) · [architecture.md](./architecture.md) · [tasklist.md](../tasklist.md)  
**Stack:** Next.js 16 App Router · TypeScript · Prisma · Tailwind CSS · shadcn/ui

---

## Current State

All backend logic through Phase 5 is complete. The admin shell exists at `app/admin/` with working routes for every module. **This guide covers upgrading the admin UI layer** — the layout, navigation, overview page, and each module page — to match the design spec in `admin-dashboard-idea.md`.

### What already works

| Route | Status |
|---|---|
| `/admin` | ✅ Overview with 6 KPI cards (plain shadcn Cards) |
| `/admin/events` | ✅ Full CRUD, publish/cancel/archive |
| `/admin/events/[id]` | ✅ Edit, sessions, resources |
| `/admin/sessions` | ✅ List + session management |
| `/admin/students` | ✅ Student list |
| `/admin/registrations` | ✅ Registration list + actions |
| `/admin/payments` | ✅ Payments queue + approve/reject |
| `/admin/discounts` | ✅ Coupon CRUD |
| `/admin/attendance` | ✅ Manual attendance marking |
| `/admin/certificates` | ✅ Issue/revoke/reissue |
| `/admin/notifications` | ✅ Notification history |
| `/admin/reports` | ✅ Reports + CSV export |
| `/admin/audit-logs` | ✅ Audit log viewer |
| `/admin/settings` | ✅ Platform settings |

### What needs building (UI upgrades)

1. Admin layout — dark theme, responsive sidebar, mobile drawer
2. Admin nav — icons, badges, active state, collapsible groups
3. Overview page — redesigned KPI cards, action panel, today's sessions table
4. Module pages — consistent dark-theme table/filter/action pattern

---

## Step 1 — Admin Layout (Dark Theme + Responsive Sidebar)

**File:** `app/admin/layout.tsx`  
**File:** `components/admin/admin-nav.tsx`  
**File:** `components/admin/admin-mobile-nav.tsx` *(new)*

### 1.1 Admin Layout

Replace the current plain layout with a dark-themed shell matching the public/dashboard pages.

```tsx
// app/admin/layout.tsx
import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/permissions";
import { logout } from "@/lib/auth/logout-action";
import { Button } from "@/components/ui/button";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";

export default async function AdminLayout({ children }) {
  const user = await requireAdmin();
  const initials = (user.name ?? user.email ?? "A")
    .split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between
        border-b border-slate-800 bg-slate-950/80 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <AdminMobileNav />
          <Link href="/">
            <Image src="/logo.png" alt="Ariba IT" width={110} height={34}
              className="h-8 w-auto object-contain" priority />
          </Link>
          {/* Admin badge */}
          <span className="hidden rounded-full border border-violet-500/30
            bg-violet-500/10 px-2 py-0.5 text-xs font-semibold text-violet-400 sm:block">
            Admin
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Greeting + time */}
          <span className="hidden text-xs text-slate-500 md:block">
            {user.name ?? user.email}
          </span>
          {/* Avatar */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full
            bg-gradient-to-br from-violet-500 to-cyan-600 text-xs font-bold text-white">
            {initials}
          </div>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white text-xs">
              Log out
            </Button>
          </form>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — desktop only */}
        <aside className="hidden md:flex md:w-64 md:shrink-0 md:flex-col">
          <AdminNav />
        </aside>
        {/* Main */}
        <main className="flex-1 overflow-y-auto p-4 text-white sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### 1.2 Admin Nav (Desktop Sidebar)

**Key requirements from the idea doc:**
- Icon + label for each module
- Active page indicator (gradient highlight)
- Badge showing pending action counts (e.g. pending payments)
- Collapsible section groups (Events sub-menu)

```tsx
// components/admin/admin-nav.tsx — "use client"
const NAV_GROUPS = [
  {
    label: null,
    items: [
      { href: "/admin", label: "Overview", icon: "🏠", exact: true },
    ],
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
    items: [
      { href: "/admin/settings", label: "Settings", icon: "⚙️" },
    ],
  },
];
```

Active detection:
```tsx
const isActive = item.exact
  ? pathname === item.href
  : pathname.startsWith(item.href);
```

Active style:
```
"bg-gradient-to-r from-violet-500/15 to-cyan-500/10 text-white border border-violet-500/20"
```

### 1.3 Admin Mobile Nav (Hamburger Drawer)

Use the same pattern as `MobileMenu` in the public site. The mobile nav should be a full-height drawer sliding in from the left, containing the full `AdminNav` items.

```tsx
// components/admin/admin-mobile-nav.tsx — "use client"
// State: open/closed
// Trigger: hamburger button (visible only on <md)
// Overlay: semi-transparent backdrop that closes the drawer on click
// Drawer: left-side panel containing all nav groups
```

---

## Step 2 — Admin Overview Page (Redesign)

**File:** `app/admin/page.tsx`

### 2.1 Page structure

```text
/admin
├── Page header: "Good [time], [name]" + today's date in Asia/Dhaka
├── KPI cards row (8 cards)
├── Action Required panel
├── Today's Sessions table
├── Upcoming 7-day timeline
├── Charts row (Registration trend + Revenue trend)
└── Recent Activity feed
```

### 2.2 KPI Cards

Fetch these in one `Promise.all`:

| Card | Query |
|---|---|
| Total Students | `user.count({ where: { role: "STUDENT" } })` |
| Active Events | `event.count({ where: { status: "PUBLISHED" } })` |
| Today's Sessions | `eventSession.count({ where: { startAt: today range } })` |
| Upcoming Sessions | `eventSession.count({ where: { startAt >= now, status SCHEDULED/JOIN_OPEN } })` |
| Confirmed Registrations | `registration.count({ where: { status: "CONFIRMED" } })` |
| Available Seats | Sum of `(capacity - confirmedCount)` per published event |
| Monthly Revenue | `Sum of payment.amount where status PAID and createdAt in current month` |
| Pending Payments | `paymentTransaction.count({ where: { status: "PENDING" } })` |

Card design:
```tsx
<div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
  <div className="flex items-center justify-between">
    <span className="text-2xl">{icon}</span>
    {/* trend badge */}
  </div>
  <p className="mt-3 text-3xl font-bold text-white">{value}</p>
  <p className="mt-1 text-sm text-slate-500">{label}</p>
  <Link href={href} className="mt-3 text-xs text-cyan-400 hover:underline">
    View details →
  </Link>
</div>
```

### 2.3 Action Required Panel

This is the most operationally important section. Query and display:

```tsx
const actionItems = [];

// Pending payments
if (pendingPayments > 0)
  actionItems.push({ icon: "💳", label: `${pendingPayments} payment(s) awaiting review`, href: "/admin/payments?status=PENDING", urgency: "high" });

// Sessions missing meeting links (within next 7 days)
const sessionsWithoutLinks = await prisma.eventSession.count({
  where: {
    startAt: { lte: sevenDaysFromNow },
    status: "SCHEDULED",
    meetingUrl: null,
  },
});
if (sessionsWithoutLinks > 0)
  actionItems.push({ icon: "🔗", label: `${sessionsWithoutLinks} upcoming session(s) missing meeting link`, href: "/admin/sessions", urgency: "high" });

// Certificates to issue (completed registrations without certificate)
// Students on waitlist
// Events nearly full (> 80% capacity)
```

Display as a card with colored left-border by urgency:
- `high` → `border-red-500`
- `medium` → `border-amber-500`
- `low` → `border-cyan-500`

### 2.4 Today's Sessions Table

```tsx
// Query
const todaysSessions = await prisma.eventSession.findMany({
  where: {
    startAt: { gte: startOfToday, lte: endOfToday },
  },
  include: {
    event: { select: { title: true, slug: true } },
    instructor: { select: { name: true } },
    _count: { select: { sessionAttendance: true } },
  },
  orderBy: { startAt: "asc" },
});
```

Table columns: Time · Session · Event · Platform · Students · Status · Actions

### 2.5 Charts

For Phase 1 of the redesign, use simple pure-CSS/Tailwind bar charts. Add a proper chart library (Recharts or Chart.js) in a second pass.

Simple bar chart approach:
```tsx
{data.map(d => (
  <div key={d.label} className="flex items-end gap-1">
    <div
      className="w-6 rounded-t bg-gradient-to-t from-cyan-500 to-violet-500"
      style={{ height: `${(d.value / maxValue) * 100}%` }}
    />
    <span className="text-xs text-slate-600">{d.label}</span>
  </div>
))}
```

---

## Step 3 — Events Module

**Files:** `app/admin/events/page.tsx`, `app/admin/events/[id]/page.tsx`

### 3.1 Event List Page

Upgrade the existing list to a dark-theme table with:

```tsx
<div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
  {/* Filter bar */}
  <div className="flex flex-wrap gap-3 border-b border-slate-800 p-4">
    <input placeholder="Search events..." className="..." />
    <select>{/* Status filter */}</select>
    <select>{/* Category filter */}</select>
    <select>{/* Type filter */}</select>
  </div>

  {/* Table */}
  <table className="w-full text-sm">
    <thead className="border-b border-slate-800 text-xs uppercase tracking-widest text-slate-500">
      <tr>
        <th>Event</th>
        <th>Sessions</th>
        <th>Capacity</th>
        <th>Price</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {events.map(event => (
        <tr key={event.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
          ...
        </tr>
      ))}
    </tbody>
  </table>

  {/* Pagination */}
  <div className="flex items-center justify-between p-4">...</div>
</div>
```

Status badge colors:
```tsx
const STATUS_COLORS = {
  DRAFT:               "bg-slate-500/15 text-slate-400 border-slate-500/30",
  PUBLISHED:           "bg-blue-500/15 text-blue-400 border-blue-500/30",
  REGISTRATION_OPEN:   "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  REGISTRATION_CLOSED: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  ONGOING:             "bg-violet-500/15 text-violet-400 border-violet-500/30",
  COMPLETED:           "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  CANCELLED:           "bg-red-500/15 text-red-400 border-red-500/30",
  ARCHIVED:            "bg-slate-700/15 text-slate-600 border-slate-700/30",
};
```

### 3.2 Event Detail Page (Tabs)

Add a tab layout to the event detail page:

```tsx
// Tab structure
const TABS = [
  { id: "overview",       label: "Overview" },
  { id: "sessions",       label: "Sessions" },
  { id: "registrations",  label: "Registrations" },
  { id: "payments",       label: "Payments" },
  { id: "attendance",     label: "Attendance" },
  { id: "notifications",  label: "Notifications" },
  { id: "certificates",   label: "Certificates" },
  { id: "activity",       label: "Activity Log" },
];
```

Use `searchParams.tab` to control which tab content renders — no client-side state needed (RSC-friendly).

```tsx
// app/admin/events/[id]/page.tsx
export default async function EventDetailPage({ params, searchParams }) {
  const tab = searchParams.tab ?? "overview";
  ...
  return (
    <>
      <TabBar tabs={TABS} active={tab} baseHref={`/admin/events/${params.id}`} />
      {tab === "overview"      && <EventOverviewTab event={event} />}
      {tab === "sessions"      && <EventSessionsTab event={event} />}
      {tab === "registrations" && <EventRegistrationsTab event={event} />}
      ...
    </>
  );
}
```

---

## Step 4 — Payments Module

**File:** `app/admin/payments/page.tsx`

### 4.1 Payments Queue (Priority redesign — operationally critical)

The payments page is the most time-sensitive admin page. It must:
1. Show `PENDING` tab by default
2. Approve/reject directly from the list row (no full-page navigation)
3. Show proof image inline on click

```tsx
// Tab bar
const PAYMENT_TABS = [
  { label: "Pending", status: "PENDING", color: "amber" },
  { label: "Paid", status: "PAID", color: "emerald" },
  { label: "Failed", status: "FAILED", color: "red" },
  { label: "All", status: null, color: "slate" },
];
```

Row actions (for PENDING rows):
```tsx
<form action={approveManualPayment}>
  <input type="hidden" name="paymentTransactionId" value={txn.id} />
  <button type="submit" className="... bg-emerald-500/15 text-emerald-400">
    ✓ Approve
  </button>
</form>
<form action={rejectManualPayment}>
  {/* needs reason — open a small modal/dialog */}
</form>
```

---

## Step 5 — Students Module

**File:** `app/admin/students/page.tsx`

### 5.1 Student List

Add to the existing list:
- Account status badge (ACTIVE / PENDING / SUSPENDED)
- Total registrations count
- Quick action: "View profile" → `/admin/students/[id]`

### 5.2 Student Detail Page (new)

**File:** `app/admin/students/[studentId]/page.tsx`

```tsx
// Tabs matching idea doc §8
const STUDENT_TABS = [
  "Profile", "Registrations", "Upcoming Sessions",
  "Payments", "Attendance", "Certificates", "Activity",
];
```

---

## Step 6 — Attendance Module

**File:** `app/admin/attendance/page.tsx`

### 6.1 Attendance Workspace Redesign

Current flow: Select Event → Select Session → Mark rows.

Upgrade:
1. Replace plain select inputs with searchable dropdowns
2. Show student rows as styled cards with status toggle buttons
3. Add bulk actions: "Mark all present" confirmation
4. Show join timestamp from `session_attendance.joinedAt`

```tsx
// Attendance status toggle buttons
const STATUS_OPTIONS = [
  { value: "PRESENT",  label: "Present",  color: "emerald" },
  { value: "ABSENT",   label: "Absent",   color: "red"     },
  { value: "LATE",     label: "Late",     color: "amber"   },
  { value: "EXCUSED",  label: "Excused",  color: "slate"   },
];
```

---

## Step 7 — Reports Module

**File:** `app/admin/reports/page.tsx`

### 7.1 Report Layout

Organize into three sections matching idea doc §16:

```tsx
const REPORT_SECTIONS = [
  {
    label: "Operational",
    reports: ["registrations", "seat-utilization", "session-readiness", "attendance"],
  },
  {
    label: "Financial",
    reports: ["revenue", "payment-success", "coupon-impact"],
  },
  {
    label: "Students",
    reports: ["new-students", "completion-rate", "repeat-enrollment"],
  },
];
```

Each report card:
```tsx
<div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
  <h3>{report.label}</h3>
  <p className="text-3xl font-bold">{report.value}</p>
  {/* Mini chart or trend */}
  <a href={report.csvHref} className="text-xs text-cyan-400">Export CSV →</a>
</div>
```

---

## Step 8 — Settings Module

**File:** `app/admin/settings/page.tsx`

### 8.1 Settings Tab Layout

Group settings into tabs matching idea doc §17:

```tsx
const SETTINGS_TABS = [
  { id: "general",      label: "General",      icon: "🏢" },
  { id: "registration", label: "Registration",  icon: "📋" },
  { id: "payments",     label: "Payments",      icon: "💳" },
  { id: "email",        label: "Email",         icon: "📧" },
  { id: "sessions",     label: "Sessions",      icon: "🎥" },
  { id: "certificates", label: "Certificates",  icon: "🏆" },
  { id: "security",     label: "Security",      icon: "🔐" },
];
```

---

## Step 9 — Shared UI Components

### 9.1 AdminPageHeader

Every admin page should use a consistent page header:

```tsx
// components/admin/admin-page-header.tsx
export function AdminPageHeader({
  title, description, actions, breadcrumbs,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {description && <p className="text-sm text-slate-400">{description}</p>}
      </div>
      {actions && <div className="flex gap-3">{actions}</div>}
    </div>
  );
}
```

### 9.2 StatusBadge

```tsx
// components/admin/status-badge.tsx
export function StatusBadge({ status, map }: { status: string; map: Record<string, string> }) {
  const colorClass = map[status] ?? "bg-slate-500/15 text-slate-400 border-slate-500/30";
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
```

### 9.3 AdminTable

Wrap the repeating table pattern into a reusable component:

```tsx
// components/admin/admin-table.tsx
export function AdminTable({ columns, rows, emptyMessage }: AdminTableProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-800">
          <tr>
            {columns.map(col => (
              <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold
                uppercase tracking-widest text-slate-500">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length}
              className="py-12 text-center text-sm text-slate-600">
              {emptyMessage ?? "No data found."}
            </td></tr>
          ) : rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3 text-slate-300">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Step 10 — Commit Checkpoints

Follow this order when committing, so each commit is independently deployable:

```bash
# 1. Layout and nav
git commit -m "feat(admin): dark theme layout, responsive sidebar, mobile drawer"

# 2. Shared components
git commit -m "feat(admin): AdminPageHeader, StatusBadge, AdminTable components"

# 3. Overview page
git commit -m "feat(admin): redesign overview — KPI cards, action panel, today's sessions"

# 4. Events module
git commit -m "feat(admin): events list dark table + event detail tabs"

# 5. Payments module
git commit -m "feat(admin): payments queue tabs + inline approve/reject"

# 6. Students module
git commit -m "feat(admin): students list + student detail page tabs"

# 7. Attendance module
git commit -m "feat(admin): attendance workspace redesign"

# 8. Reports module
git commit -m "feat(admin): reports page section layout + mini charts"

# 9. Settings module
git commit -m "feat(admin): settings tab layout"
```

---

## Design Tokens (Dark Theme)

Use these consistently across all admin pages:

| Token | Tailwind class |
|---|---|
| Page background | `bg-slate-950` |
| Card background | `bg-slate-900` |
| Card border | `border-slate-800` |
| Hover row | `hover:bg-slate-800/30` |
| Section label | `text-xs uppercase tracking-widest text-slate-500` |
| Primary value | `text-white font-bold` |
| Secondary text | `text-slate-400` |
| Muted text | `text-slate-600` |
| Cyan accent | `text-cyan-400` / `from-cyan-500` |
| Violet accent | `text-violet-400` / `from-violet-500` |
| Success | `bg-emerald-500/15 text-emerald-400 border-emerald-500/30` |
| Warning | `bg-amber-500/15 text-amber-400 border-amber-500/30` |
| Danger | `bg-red-500/15 text-red-400 border-red-500/30` |
| Info | `bg-blue-500/15 text-blue-400 border-blue-500/30` |

---

## Priority Order

Build in this order for maximum visible impact per session:

1. ✅ **Admin layout + sidebar** — affects every page immediately
2. ✅ **Shared components** (AdminPageHeader, StatusBadge, AdminTable)
3. ✅ **Overview page** — first thing admin sees daily
4. 🔜 **Payments queue** — operationally critical, time-sensitive
5. 🔜 **Events list + detail tabs** — most-used module
6. 🔜 **Students + Registrations** — second most used
7. 🔜 **Attendance workspace** — daily ops
8. 🔜 **Reports** — weekly use
9. 🔜 **Settings** — rare, lowest urgency
