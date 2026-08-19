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

- [x] `categories`, `instructors` tables + admin CRUD (list + create; no edit/delete UI yet — not needed for MVP volume)
- [x] `events` table + admin CRUD (create/update/publish/cancel/archive)
- [x] `event_sessions` table + admin CRUD (create/edit/cancel; multiple Sessions per Event)
- [x] Event status enum + transitions — admin-triggered publish/cancel/archive only; `REGISTRATION_OPEN`/`REGISTRATION_CLOSED`/`ONGOING`/`COMPLETED` reserved for a future automated status cron
- [x] Session status enum + transitions (edit reschedules → `RESCHEDULED`; cancel → `CANCELLED`)
- [x] Public Event listing (`/events`) with filters: keyword, category, type, free/paid, sort — instructor filter, explicit date filter, and registration-status filter not built (low value pre-launch with few Events; revisit if the catalog grows)
- [x] Public Event detail page (no meeting data exposed — verified via a dedicated safe-select query)
- [x] Schedule page (chronological list of upcoming Sessions; not a calendar grid)
- [x] Instructor profile pages
- [x] `registrations` table + unique `(user_id, event_id)`
- [x] Free registration flow (`registerFree`) — atomic confirm, Serializable transaction
- [x] Capacity validation inside DB transactions (confirmed registrations count toward capacity)
- [x] Waitlist flow when capacity full, with automatic promotion on cancellation
- [x] Student dashboard: My Events, My Sessions, Overview counts wired to real data — no separate calendar-grid view (My Sessions is a chronological list)

Verified end-to-end in the browser: admin creates Category → Instructor →
Event → Session → Publish; public listing/detail/schedule/instructor pages
render correctly; two students confirmed the capacity-1/1 seat and waitlist
path (1/1 filled → 2nd registrant waitlisted); cancelling the confirmed
registration auto-promoted the waitlisted one; dashboard/admin overview
counts reflected all of it.

Moved to Phase 3: `seat_holds` table + state machine and the `expire-seat-holds`
cron only matter once paid checkout exists to create holds — free registration
confirms atomically with no hold step (`idea.md` §6.2), so building them here
would be unused scaffolding.

## Phase 3 — Commerce (Manual bKash/Nagad)

- [x] `seat_holds` table + state machine (`HELD → CONFIRMED` / `EXPIRED`) — moved from Phase 2, see note there
- [x] Cron: `expire-seat-holds` — protected by `CRON_SECRET`; cascades to `EXPIRED` registration + `CANCELLED` payment
- [x] `discounts`, `discount_events`, `discount_redemptions` tables
- [x] Admin coupon CRUD (create + deactivate; sitewide by default, scoped by attaching to specific Events from the Event edit page)
- [x] `validateCoupon` — active/window/usage caps/eligibility/min purchase, payable never negative (`lib/discounts/validate.ts`)
- [x] `payments`, `payment_transactions` tables with manual-proof fields, `trx_id` unique per method
- [x] `startPaidCheckout` action — hold seat, compute payable amount, show bKash/Nagad number + amount; reuses the registration row on retry after expiry/cancellation
- [x] Student payment-proof submission UI + `submitManualPaymentProof` action — resubmission after rejection reuses the same TrxID row rather than creating a duplicate
- [x] Admin Payments queue UI (pending manual submissions)
- [x] `approveManualPayment` action — atomic payment+registration+seat-hold confirm; receipt appears on `/dashboard/payments/[id]`
- [x] `rejectManualPayment` action — mark failed with a reason shown to the student, allows resubmission
- [x] Immutable price/discount snapshot on registration at checkout time
- [x] Registration and payment snapshot never mutated by later Event price changes (snapshots copied once, never re-derived)
- [x] Receipts — in-app view only (`/dashboard/payments/[id]`); PDF download not built (not required by `idea.md`'s MVP wording)

Not built: audit-log entries for approve/reject (deferred to Phase 5's
`audit_logs` table per the original plan — `PaymentTransaction.reviewedById/
reviewedAt/reviewNote` already carries the accountability trail in the
meantime) and notifications on approve/reject/waitlist (Phase 4). Paid-event
waitlisting was scoped out entirely — see the note in `prisma/schema.prisma`
above the `SeatHold` model.

Verified end-to-end in the browser: admin created a sitewide 10% coupon and
a capacity-1 paid Event; a student checked out with the coupon (৳500 → ৳450),
submitted a bKash proof, and a second student was correctly blocked by the
seat hold even though the confirmed-registration count still read 0/1; admin
approved it, registration flipped to CONFIRMED and the event showed full;
a separate reject → resubmit-with-same-TrxID → approve cycle worked on a
second Event; manually expiring a seat hold and hitting the cron endpoint
(401 without `CRON_SECRET`, 200 with it) correctly cascaded the registration
to EXPIRED and payment to CANCELLED, and the student could then start a
fresh checkout that reused the same registration row (no duplicate, no
unique-constraint error). Also fixed a real bug found along the way: the
admin Event-edit page rendered `EventForm` and `SessionForm` together, and
both used bare ids like `id="title"`/`id="startAt"` — duplicate DOM ids that
could mislabel real users' Tab/label-click focus, not just an automation
artifact. `SessionForm`'s ids are now prefixed (`session-title`, etc).

## Phase 4 — Live Delivery

- [x] Protected join route `app/dashboard/sessions/[sessionId]/join` per `docs/api.md` §3
- [x] Join-window validation (20 min before → 15 min after scheduled end, both configurable via Settings)
- [x] Encrypt meeting URL/passcode at rest (AES-256-GCM, `lib/security/crypto.ts`); decrypted only inside the join handler — admin edit forms never display the value back, only overwrite-on-submit
- [x] `session_attendance` table + join-timestamp logging
- [x] Admin manual attendance marking (present/absent/late/excused), student-facing read view
- [x] Notification module: in-app + email adapter (`lib/notifications/`) — also retrofitted onto Phase 2/3 flows that idea.md lists as notification triggers but which hadn't been wired yet: registration confirmed/waitlisted, waitlist promotion, payment confirmed/failed
- [x] Cron: `session-reminders` (every 5 min, 20-min-before window) — dedup is an existence check per (user, session) in the cron rather than a DB unique constraint, since a blanket constraint would also wrongly collide unrelated ANNOUNCEMENTs (see the comment on the Notification model)
- [x] Cron: `session-status-sync` (`SCHEDULED → JOIN_OPEN → LIVE → COMPLETED`) — re-reads status between steps so an overdue Session cascades fully in one run
- [x] Reschedule/cancel workflow — new notification, invalidate stale reminders (old `SESSION_REMINDER` rows deleted so the reminders cron isn't blocked from firing fresh ones at the new time)
- [x] Announcements (admin → an Event's confirmed + waitlisted registrants)
- [x] Event completion workflow — admin-triggered `completeEvent`; all-Sessions-done/attendance-reviewed is a human judgment call, not automated. Certificate issuance is still Phase 5.

Two real bugs found and fixed while testing this phase (not automation
artifacts):
1. `datetime-local` inputs only carry minute precision, but the stored
   `startAt`/`endAt` had seconds/ms from `new Date()`. Saving a Session
   without touching the time fields lost that precision on the round trip
   and made the "did the timing change?" check see a false positive —
   every save silently flipped the Session to `RESCHEDULED` and fired a
   reschedule notification. Fixed by comparing at minute granularity.
2. The "Publish" button showed on any Event that wasn't `PUBLISHED` or
   `CANCELLED` — including the new `COMPLETED` status, so it was possible
   to accidentally un-complete a finished Event. Restricted to `DRAFT` only.

Verified end-to-end in the browser: set a Session's meeting URL through the
real admin form and confirmed the stored value was ciphertext, not
plaintext; joined as a student and confirmed the redirect landed on the
exact decrypted URL with an attendance row logged (`joinedAt` set, `status`
null); admin marked it `PRESENT` and the student saw it reflected; sent an
Event announcement and confirmed it showed unread → mark-read → mark-all-read
on the student's Notifications page and in the Overview's unread count;
ran both crons unauthenticated (401) and with `CRON_SECRET` (200) —
`session-status-sync` cascaded a due Session `SCHEDULED → JOIN_OPEN → LIVE`
in one call, `session-reminders` sent once then correctly deduped on a
second run; completed an Event and confirmed the registration flipped to
`COMPLETED` with a notification sent; cancelled a Session and confirmed its
pending reminder was deleted.

## Phase 5 — Certificates and Reporting

- [x] `certificates` table — unique certificate number, QR verification token
- [x] Certificate issue/revoke/reissue admin actions + audit log
- [x] PDF generation + student download
- [x] Public certificate verification page (minimal PII)
- [x] `event_resources` table + upload/download (signed/authorized access)
- [x] `reviews` table + public testimonials section
- [x] `audit_logs` table + write path for every privileged action listed in `docs/security.md` §8
- [x] Reports: registration by Event/date, free vs paid, seat utilization, conversion, revenue, discount usage, payment success/failure, attendance/completion, instructor performance, certificate issuance
- [x] CSV export
- [x] Admin overview dashboard cards (§5.9 in `idea.md`)
- [x] Student dashboard overview cards (§5.8 in `idea.md`)

Notes on scope decisions:
- `event_resources` are admin-provided links, not file uploads — `STORAGE_*`
  env vars are still placeholders (no storage provider wired up). Access is
  still properly gated: a protected `/dashboard/resources/[resourceId]/view`
  redirect route mirrors the Phase 4 Session-join pattern, checking for a
  `CONFIRMED`/`COMPLETED` registration server-side before redirecting —
  resource URLs never appear in client-rendered JSX/RSC payload.
- Certificate verification uses a random `verificationToken` (not the
  human-readable `certificateNumber`) as the public lookup key, so a
  leaked/guessed certificate number alone can't be used to probe the
  verification endpoint.
- `getPublishedTestimonials()` (`lib/reviews/queries.ts`) is built and ready
  for the homepage testimonials section but intentionally not wired in —
  that section belongs to the landing-page redesign in progress in another
  session, same boundary respected for the "Upcoming Events" wiring earlier.
- Audit logging was retrofitted onto every existing privileged admin
  mutation from Phases 1-4 (Event/Session create/update/publish/cancel/
  archive/complete, manual payment approve/reject, attendance marking), not
  just the new Phase 5 actions — `docs/security.md` §8 lists all of these
  as required.

One real bug found and fixed while testing this phase (not an automation
artifact): the hand-maintained `NotificationType` union in
`lib/notifications/index.ts` didn't include the new `CERTIFICATE_ISSUED`
value, causing a type error at the certificate-issue call site. Fixed by
importing the real Prisma-generated `NotificationType` instead of
duplicating the enum by hand — removes this whole class of drift bug going
forward.

Verified end-to-end in the browser against a seeded scenario (one paid,
attended, completed registration and one still-confirmed registration on
the same Event): issued a certificate and downloaded the real PDF —
correct student name/Event title/certificate number/issue date and a
scannable embedded QR code linking to the verification page; the public
verification page showed the correct Valid state; revoked it with a reason
and confirmed the verification page flipped to Revoked and the download
route returned 410; reissued it and confirmed status returned to Issued and
the download route worked again — all three actions (`certificate.issue`,
`certificate.revoke`, `certificate.reissue`) appeared correctly on
`/admin/audit-logs` with the right actor and summary. Added an Event
resource as admin, confirmed it was inaccessible to a registrant without a
`CONFIRMED`/`COMPLETED` registration and accessible (redirected to the
real URL) to one that had it. Submitted a review as a student, confirmed it
stayed unpublished until an admin toggled Publish, and that resubmitting an
edited review reset it to unpublished. Cross-checked every number on
`/admin/reports` against the seeded data (registrations by status, free/paid
split, revenue, payment success/failure, attendance/completion rate,
certificate issued/revoked counts, instructor rating average) and confirmed
an exact match; exported the registrations CSV and confirmed the file
contained the correct rows and fields. All Phase 5 seed data (category,
instructor, Event, Session, both registrations, payment + transaction,
attendance, certificate, review, audit logs) removed from the production
Neon DB afterward via a cleanup script; `npx tsc --noEmit` and `npx eslint .`
both clean (one pre-existing unrelated warning in the other session's
landing-page file).

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
