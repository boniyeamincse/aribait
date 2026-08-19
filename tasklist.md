# Ariba IT — Task List

**Document type:** Phase-wise implementation task list
**Related documents:** [idea.md](./idea.md), [docs/architecture.md](./docs/architecture.md), [docs/database.md](./docs/database.md), [docs/api.md](./docs/api.md), [docs/security.md](./docs/security.md), [docs/deployment.md](./docs/deployment.md)

Checkboxes track progress. Phases mirror `idea.md` §14 Product Roadmap; task detail mirrors `idea.md` §13 MVP Scope and the four `docs/` references above.

---

## Phase 1 — Foundation

- [x] Scaffold Next.js (App Router) + TypeScript project at repo root
- [x] Install and configure Tailwind CSS
- [x] Install and configure shadcn/ui
- [ ] Install React Hook Form + Zod — Zod validates every action; RHF installed but not yet wired into a form (native FormData + `useActionState` used for auth forms; RHF lands with richer Phase 2 forms)
- [x] Set up Prisma ORM, connect to Neon PostgreSQL, initial `schema.prisma`
- [x] First migration: `users`, `accounts`, `sessions`, `verification_tokens`, `settings`
- [x] Configure Auth.js (email/password, email verification, session cookies) — verify/reset emails log to console in dev (no `EMAIL_API_KEY` yet)
- [x] Role-based access control (student / admin) + route protection middleware — `proxy.ts` (optimistic) + `requireUser`/`requireAdmin` (real, server-side)
- [x] Base layout, design tokens, shared UI shell (`components/ui/`)
- [x] Public site shell: header, footer, nav
- [x] Dashboard shell (student) — empty routes per `docs/architecture.md` §6
- [x] Admin shell — empty routes, admin-only guard
- [x] Environment variable setup (`.env.example`) per `docs/security.md` §9
- [ ] `.gitignore`, git init, initial commit — `.gitignore` in place, repo initialized and staged; no commit made yet

## Phase 2 — Event and Enrollment MVP

- [ ] `categories`, `instructors` tables + admin CRUD
- [ ] `events` table + admin CRUD (create/update/publish/cancel/archive)
- [ ] `event_sessions` table + admin CRUD (multiple Sessions per Event)
- [ ] Event status enum + transitions (`DRAFT` → ... → `ARCHIVED`)
- [ ] Session status enum + transitions (`SCHEDULED` → ... → `CANCELLED`/`RESCHEDULED`)
- [ ] Public Event listing (`/events`) with filters: keyword, category, free/paid, date, instructor, type, registration status; sorting
- [ ] Public Event detail page (no meeting data exposed)
- [ ] Schedule/calendar page
- [ ] Instructor profile pages
- [ ] `registrations` table + unique `(user_id, event_id)`
- [ ] `seat_holds` table + state machine (`AVAILABLE → HELD → CONFIRMED` / `EXPIRED`)
- [ ] Free registration flow (`registerFree`) — atomic confirm
- [ ] Capacity validation inside DB transactions (holds + confirmed both count)
- [ ] Waitlist flow when capacity full
- [ ] Student dashboard: My Events, My Sessions, Upcoming Classes, Training Calendar
- [ ] Cron: `expire-seat-holds`

## Phase 3 — Commerce (Manual bKash/Nagad)

- [ ] `discounts`, `discount_events`, `discount_redemptions` tables
- [ ] Admin coupon CRUD
- [ ] `validateCoupon` action — active/window/usage caps/eligibility/min purchase, payable never negative
- [ ] `payments`, `payment_transactions` tables with manual-proof fields (`method`, `receiving_msisdn`, `sender_msisdn`, `trx_id` unique per method, `proof_image_url`, `reviewed_by`, `reviewed_at`, `review_note`) per `docs/database.md` §2.8
- [ ] `startPaidCheckout` action — hold seat, compute payable amount, show bKash/Nagad number `01914638653` + amount
- [ ] Student payment-proof submission UI + `submitManualPaymentProof` action
- [ ] Admin Payments queue UI (pending manual submissions)
- [ ] `approveManualPayment` action — atomic payment+registration confirm, receipt, notification, audit log
- [ ] `rejectManualPayment` action — mark failed, notify with reason, allow resubmission, audit log
- [ ] Immutable price/discount snapshot on registration at checkout time
- [ ] Registration and payment snapshot never mutated by later Event price changes
- [ ] Receipts (view/download)

## Phase 4 — Live Delivery

- [ ] Protected join route `app/dashboard/sessions/[sessionId]/join` per `docs/api.md` §3
- [ ] Join-window validation (20 min before → 15 min after scheduled end)
- [ ] Encrypt meeting URL/passcode at rest; decrypt only inside join handler
- [ ] `session_attendance` table + join-timestamp logging
- [ ] Admin manual attendance marking (present/absent/late/excused)
- [ ] Notification module: in-app + email adapter (`lib/notifications/`)
- [ ] Cron: `session-reminders` (every 5 min, 20-min-before window, unique per `(user_id, session_id, notification_type)`)
- [ ] Cron: `session-status-sync` (`SCHEDULED → JOIN_OPEN → LIVE → COMPLETED`)
- [ ] Reschedule/cancel workflow — new notification, invalidate stale reminders
- [ ] Announcements (admin → students)
- [ ] Event completion workflow (all Sessions done → attendance reviewed → Event `COMPLETED` → eligible registrations `COMPLETED`)

## Phase 5 — Certificates and Reporting

- [ ] `certificates` table — unique certificate number, QR verification token
- [ ] Certificate issue/revoke/reissue admin actions + audit log
- [ ] PDF generation + student download
- [ ] Public certificate verification page (minimal PII)
- [ ] `event_resources` table + upload/download (signed/authorized access)
- [ ] `reviews` table + public testimonials section
- [ ] `audit_logs` table + write path for every privileged action listed in `docs/security.md` §8
- [ ] Reports: registration by Event/date, free vs paid, seat utilization, conversion, revenue, discount usage, payment success/failure, attendance/completion, instructor performance, certificate issuance
- [ ] CSV export
- [ ] Admin overview dashboard cards (§5.9 in `idea.md`)
- [ ] Student dashboard overview cards (§5.8 in `idea.md`)

---

## Cross-Cutting (ongoing through every phase)

- [ ] Zod validation on every Server Action / Route Handler input
- [ ] Server-side authorization check on every protected action (never UI-only)
- [ ] Rate limiting: login, registration, coupon validation, payment submission
- [ ] Server-side pagination on all Admin tables
- [ ] Accessibility pass (keyboard nav, labels, contrast, semantic structure)
- [ ] `Asia/Dhaka` default time zone, BDT currency handling
- [ ] Preview deployment + Neon branch per PR (`docs/deployment.md` §3)
- [ ] Error/performance monitoring wired in

---

## Deferred (explicitly out of MVP — `idea.md` §13)

- Automated Zoom meeting creation
- Automated Zoom attendance synchronization
- SMS and WhatsApp notification
- Advanced certificate designer
- Recorded course/LMS capability
- Native mobile application
- Multi-instructor portal
- Real payment gateway integration (manual bKash/Nagad is the MVP method)
- Advanced refunds and accounting integration
