# Ariba IT — Architecture

**Document type:** Technical architecture reference
**Related document:** [idea.md](./idea.md)

---

## 1. Architectural Style

Ariba IT is a full-stack Next.js application deployed on Vercel, using the App Router with a mix of Server Components, Server Actions, and Route Handlers. There is no separate backend service in the MVP — the Next.js server layer, the scheduled cron jobs, and the database access layer all live in one deployable unit. This keeps the MVP simple to operate while the module boundaries (payments, notifications, meeting platforms) stay adapter-based so any piece can be extracted into its own service later without a rewrite.

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js (App Router) | Full-stack web application |
| Language | TypeScript | Type safety and maintainability |
| UI | React | Interactive user interface |
| Styling | Tailwind CSS | Responsive design system |
| Components | shadcn/ui | Accessible reusable components |
| Forms | React Hook Form | Form state and submission |
| Validation | Zod | Shared server/client validation |
| Authentication | Auth.js | Authentication and session handling |
| Database | Neon PostgreSQL | Managed serverless relational database |
| ORM | Prisma ORM | Schema, migrations and typed data access |
| Hosting | Vercel | Deployment and scheduled jobs |
| File storage | S3-compatible object storage | Images, resources and certificates |
| Email | Transactional email provider | Verification, reminders and receipts |
| Monitoring | Error and performance monitoring service | Production observability |

## 3. High-Level Integration Diagram

```text
Browser
   ↓
Next.js on Vercel
   ├── Public and dashboard UI (React Server/Client Components)
   ├── Server Actions / Route Handlers
   ├── Authentication and authorization (Auth.js)
   ├── Payment abstraction (adapter interface)
   ├── Notification service (email / in-app, adapter interface)
   ├── Meeting-platform abstraction (Zoom / Meet / Teams, adapter interface)
   └── Scheduled reminder job (Vercel Cron → /api/cron/*)
           ↓
      Neon PostgreSQL (via Prisma)
           ↓
      S3-compatible object storage (images, resources, certificates)
```

## 4. Module Map

The application is organized around the modules defined in `idea.md` §5:

1. Public Website
2. Authentication and Account
3. Event Management
4. Live Session Management
5. Registration and Seat Booking
6. Payment
7. Discount and Coupon
8. Student Dashboard
9. Admin Dashboard
10. Notification
11. Secure Live Class Join
12. Attendance
13. Certificate
14. Reports and Analytics
15. Content and Settings
16. Audit and Activity Log

Each module maps to a route group and/or a `lib/` domain folder, described in §6.

## 5. Core Domain Model

The platform is built around one unified **Event** entity that owns one or more **Session** entities:

```text
Event / Training Program
├── Event information
├── Instructor
├── Registration period
├── Seat capacity
├── Free or paid enrollment
├── Discount and payment rules
└── One or more online sessions
    ├── Session 1 — Zoom
    ├── Session 2 — Google Meet
    └── Session 3 — Microsoft Teams
```

A student registers once against an Event; a confirmed registration grants access to every eligible Session under that Event. See [database.md](./database.md) for the full entity/relationship model.

## 6. Application Structure

```text
ariba-it/
├── app/
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── events/
│   │   ├── training/
│   │   ├── schedule/
│   │   ├── instructors/
│   │   └── contact/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   ├── verify-email/
│   │   └── forgot-password/
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── events/
│   │   ├── sessions/
│   │   ├── attendance/
│   │   ├── certificates/
│   │   ├── payments/
│   │   ├── notifications/
│   │   └── profile/
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── events/
│   │   ├── sessions/
│   │   ├── students/
│   │   ├── instructors/
│   │   ├── registrations/
│   │   ├── payments/
│   │   ├── discounts/
│   │   ├── attendance/
│   │   ├── certificates/
│   │   ├── reports/
│   │   └── settings/
│   ├── api/
│   │   ├── payments/
│   │   ├── webhooks/
│   │   ├── cron/
│   │   └── sessions/
│   └── layout.tsx
├── components/
│   ├── ui/
│   ├── public/
│   ├── dashboard/
│   └── admin/
├── lib/
│   ├── auth/
│   ├── db/
│   ├── payments/
│   ├── notifications/
│   ├── permissions/
│   ├── security/
│   └── validations/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
├── types/
├── tests/
└── docs/
```

## 7. Adapter Boundaries

Three subsystems are deliberately abstracted behind an interface so the concrete provider can be swapped without touching business logic:

- **Payment adapter** (`lib/payments/`) — one interface for checkout initiation, verification, and webhook parsing; concrete implementation per gateway (BDT-focused providers evaluated at implementation time).
- **Notification adapter** (`lib/notifications/`) — one interface for "send," with in-app and email channels in the MVP; SMS/WhatsApp/push are additive channels behind the same interface.
- **Meeting-platform metadata** — Session stores a `platform` enum (Zoom, Google Meet, Microsoft Teams, custom) plus protected connection details; no platform-specific business logic leaks into the registration/seat/payment flow.

## 8. Request Flow: Protected Session Join

```text
Student clicks Join Live Class
        ↓
Server validates authenticated user
        ↓
Server validates confirmed registration/payment
        ↓
Server validates Session status and join window
        ↓
Join attempt is logged
        ↓
Server redirects to Zoom/Meet/Teams
```

Route shape: `/dashboard/sessions/{sessionId}/join`. This is a server-rendered redirect, never a client-fetched meeting URL — see [security.md](./security.md) §4.

## 9. Deployment Topology

```text
GitHub Repository
       ↓
Vercel Preview Deployment
       ↓
Automated checks
       ↓
Production Deployment
       ↓
Neon Production Database
```

Full detail in [deployment.md](./deployment.md).

## 10. Scalability Notes

- The app is stateless; horizontal scaling is handled by Vercel's platform.
- The relational database is the source of truth and enforces constraints (capacity, uniqueness, non-negative amounts) so correctness does not depend solely on application code.
- A queue/background worker can be introduced later for notification fan-out or webhook processing if cron-based polling becomes insufficient.
