# Ariba IT — API Reference

**Document type:** API surface reference
**Related document:** [idea.md](./idea.md), [architecture.md](./architecture.md), [database.md](./database.md)

---

## 1. Conventions

- Most reads/writes for authenticated dashboard and admin flows use **Server Actions**, not public REST endpoints — the browser never talks to a generic CRUD API.
- **Route Handlers** under `app/api/` exist only where an external caller (payment gateway, cron trigger, webhook sender) or a non-Server-Action browser interaction (e.g., a signed redirect) is required.
- All inputs are validated server-side with Zod, even when a client-side schema already validated the form.
- Every protected action re-checks authorization server-side; a hidden UI element is never treated as an authorization boundary.
- List endpoints/actions use server-side pagination for Admin tables.

## 2. Route Handlers (`app/api/`)

### 2.1 `app/api/payments/`

MVP payment is **manual bKash/Nagad** — there is no hosted checkout redirect, so this group is thin. All work happens through Server Actions (§4.4a) rather than a route handler; `app/api/payments/` is reserved for a future gateway integration.

| Route | Method | Purpose |
|---|---|---|
| `/api/payments/status/[transactionId]` | GET | Poll manual payment review status for client-side checkout UI (`PENDING` / `PAID` / `FAILED`). |

### 2.2 `app/api/webhooks/`

Not used in the MVP (no gateway). Reserved for a future provider's callback: verify provider signature, idempotently confirm `payment_transactions` + `registrations` in a DB transaction, convert the seat hold to confirmed. Webhook handlers must never trust a client-supplied "success" flag — confirmation only happens after server-side signature verification, mirroring how manual review confirmation only happens after admin approval today.

### 2.3 `app/api/cron/`

| Route | Method | Purpose |
|---|---|---|
| `/api/cron/session-reminders` | GET/POST (Vercel Cron) | Runs every 5 minutes. Finds Sessions starting in the reminder window, finds confirmed eligible students, creates one notification per `(user_id, session_id, notification_type)`, sends in-app + email, records sent/failed status. |
| `/api/cron/expire-seat-holds` | GET/POST (Vercel Cron) | Releases `seat_holds` past their hold expiry back to `AVAILABLE`. |
| `/api/cron/session-status-sync` | GET/POST (Vercel Cron) | Transitions `event_sessions` through `SCHEDULED → JOIN_OPEN → LIVE` based on the configured join window. |

Cron routes are protected by a `CRON_SECRET` shared-secret header, not by user session.

### 2.4 `app/api/sessions/`

| Route | Method | Purpose |
|---|---|---|
| `/api/sessions/[sessionId]/join` | GET | Protected join redirect — see §3. |

## 3. Secure Live Class Join (protected redirect)

```text
GET /dashboard/sessions/{sessionId}/join
        ↓
Server validates authenticated user
        ↓
Server validates confirmed registration/payment for the parent Event
        ↓
Server validates Session status and join window (open 20 min before, until 15 min after scheduled end)
        ↓
Join attempt is logged (session_attendance join timestamp)
        ↓
302 redirect to the decrypted Zoom/Meet/Teams URL
```

The meeting URL/passcode is decrypted server-side only for this one redirect response; it is never included in any JSON payload, public page, static HTML, client log, or analytics event.

## 4. Server Actions by Domain

Server Actions are organized to mirror `lib/` domain folders. Representative actions per module (not exhaustive — implementation may split further):

### 4.1 Auth (`lib/auth/`)
- `registerStudent`, `verifyEmail`, `login`, `logout`, `requestPasswordReset`, `resetPassword`

### 4.2 Events (admin) (`app/admin/events/`)
- `createEvent`, `updateEvent`, `publishEvent`, `cancelEvent`, `archiveEvent`, `listEventsForAdmin` (paginated)

### 4.3 Sessions (admin) (`app/admin/sessions/`)
- `createEventSession`, `updateEventSession`, `rescheduleEventSession`, `cancelEventSession`, `setSessionMeetingDetails` (encrypts URL/passcode before persisting)

### 4.4 Registration & Seats (`lib/db/` + `app/dashboard/events/`)
- `registerFree` — validates window/capacity, creates `CONFIRMED` registration atomically
- `startPaidCheckout` — creates `seat_hold`, computes payable amount after coupon, returns the receiving bKash/Nagad number and amount for the student to pay manually
- `cancelRegistration` — applies cancellation policy
- `joinWaitlist`, `promoteFromWaitlist` (admin or automatic on cancellation)

### 4.4a Manual Payment Review (`app/admin/payments/` + `app/dashboard/payments/`)
- `submitManualPaymentProof(registrationId, method, senderMsisdn, trxId, proofImage?)` — student action; creates a `PENDING` `payment_transactions` row, rejects duplicate `trxId` for the method
- `approveManualPayment(transactionId)` — admin-only; confirms payment (`PAID`) and registration (`CONFIRMED`) atomically, converts the seat hold, sends receipt + confirmation, writes audit log entry
- `rejectManualPayment(transactionId, reason)` — admin-only; sets `FAILED`, notifies student with reason, writes audit log entry, leaves registration open for resubmission

### 4.5 Coupons (`app/admin/discounts/` + checkout flow)
- `createCoupon`, `updateCoupon`, `deactivateCoupon`
- `validateCoupon(code, eventId, userId)` — checks active, validity window, usage caps, per-user cap, event eligibility, minimum purchase; returns payable amount (never negative)

### 4.6 Attendance (`app/admin/attendance/` + `app/dashboard/attendance/`)
- `markAttendance(registrationId, sessionId, status)` — admin manual marking (present/absent/late/excused), with audit log entry

### 4.7 Certificates (`app/admin/certificates/` + `app/dashboard/certificates/`)
- `issueCertificate`, `revokeCertificate`, `reissueCertificate`, `downloadCertificate`
- Public: `verifyCertificate(certificateNumber)` — no unnecessary student data exposed

### 4.8 Notifications (`lib/notifications/`)
- `sendNotification(userId, type, payload)` — adapter dispatch (in-app + email)
- Triggered internally by registration confirmation, payment success/failure, reschedule/cancel, waitlist promotion, certificate issuance, refund update

### 4.9 Reports (`app/admin/reports/`)
- `getRegistrationReport`, `getRevenueReport`, `getAttendanceReport`, `getDiscountUsageReport`, `exportReportCsv`

### 4.10 Settings (`app/admin/settings/`)
- `updateSiteSettings`, `updateEmailTemplates`, `updateNotificationTemplates`, `toggleMaintenanceMode`

## 5. Public (Unauthenticated) Read Surface

Public Event/Session data is served through Server Components reading directly from the database (no public JSON API needed for the MVP):

- `/events`, `/training`, `/schedule`, `/instructors`, `/events/[slug]` — published Events only, with filters: keyword, category, free/paid, date, instructor, event type, registration status; sort: newest, upcoming, popular, price.

Meeting IDs, meeting URLs, and passcodes are **excluded at the query level** for any public-facing read — not merely hidden in the UI.

## 6. Error & Response Conventions

- Server Actions throw typed errors caught by the calling UI; user-facing messages avoid leaking internal details (query errors, stack traces).
- Route Handlers return structured JSON `{ error: { code, message } }` on failure with appropriate HTTP status.
- Rate limiting applies to: login, registration, coupon validation, and payment initiation endpoints/actions.
