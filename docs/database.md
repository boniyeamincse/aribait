# Ariba IT — Database Design

**Document type:** Database reference
**Related document:** [idea.md](./idea.md), [architecture.md](./architecture.md)

---

## 1. Entity List

```text
users
accounts
sessions
verification_tokens
categories
instructors
events
event_sessions
registrations
seat_holds
payments
payment_transactions
discounts
discount_events
discount_redemptions
session_attendance
notifications
certificates
event_resources
reviews
audit_logs
settings
```

`accounts`, `sessions` (Auth.js session table, distinct from `event_sessions`), and `verification_tokens` are Auth.js-managed tables.

## 2. Entity Notes

### 2.1 users
Core identity record. Holds role (`student` / `admin`, `instructor` reserved for Phase 2), account status (`pending`, `active`, `suspended`, `deactivated`), and profile/notification preferences.

### 2.2 categories
Event taxonomy used for browsing/filtering on the public site.

### 2.3 instructors
Instructor profile shown on public Event pages; referenced by `events` and `event_sessions` (a Session may have its own host distinct from the Event's primary instructor).

### 2.4 events
The bookable product. Key fields: title, slug, description (short/full), type, category, instructor, thumbnail/banner, learning objectives, audience, prerequisites, language, capacity, price, currency, registration open/close time, start/end time, featured flag, terms/refund rules, publication status.

Status enum:
```text
DRAFT
PUBLISHED
REGISTRATION_OPEN
REGISTRATION_CLOSED
ONGOING
COMPLETED
CANCELLED
ARCHIVED
```

### 2.5 event_sessions
One or more scheduled live classes under an Event. Key fields: title, sequence number, description/agenda, start/end datetime, time zone, instructor/host, platform (Zoom / Google Meet / Microsoft Teams / custom), meeting ID, protected meeting URL (encrypted at rest), protected passcode (encrypted at rest), join-window configuration, attendance rule, resources, status.

Status enum:
```text
SCHEDULED
JOIN_OPEN
LIVE
COMPLETED
CANCELLED
RESCHEDULED
```

### 2.6 registrations
One row per student per Event (unique on `(user_id, event_id)`). Represents the student's booking of the whole Event.

Status enum:
```text
PENDING_PAYMENT
CONFIRMED
WAITLISTED
CANCELLED
EXPIRED
REFUNDED
COMPLETED
```

Must store an immutable price/discount **snapshot** at the time of registration so later Event price changes never mutate historical transactions.

### 2.7 seat_holds
Temporary capacity reservation created at checkout start, released on expiry or converted to a confirmed seat on payment success.

State transition:
```text
AVAILABLE → HELD → CONFIRMED
                 ↘ EXPIRED
```

Default hold duration: 15 minutes (configurable via `settings`).

### 2.8 payments / payment_transactions
`payments` is the logical payment record tied to a registration; `payment_transactions` captures each attempt (a registration may have more than one attempt — resubmission after rejection).

**MVP method: manual bKash/Nagad.** A transaction row stores: `method` (`bkash` / `nagad`), `receiving_msisdn` (the platform's designated number, currently `01914638653`), `sender_msisdn`, `trx_id` (student-entered TrxID), `proof_image_url` (optional screenshot), `status`, `reviewed_by` (admin user id), `reviewed_at`, `review_note`.

- `trx_id` is **unique per method** — a given bKash/Nagad TrxID can confirm at most one registration, preventing reuse/replay of the same proof across multiple bookings.
- Submission creates the row as `PENDING`; only an admin approve/reject action moves it to `PAID` or `FAILED` — there is no automated webhook in the MVP.
- When a real gateway is added later, `payment_transactions` gains gateway-specific fields (`gateway_reference`, signature metadata) behind the same table/interface; `method` gains the new provider value.

Status enum:
```text
INITIATED
PENDING
PAID
FAILED
CANCELLED
REFUNDED
PARTIALLY_REFUNDED
```

### 2.9 discounts / discount_events / discount_redemptions
`discounts` holds coupon definitions (code, percentage/fixed amount, validity window, usage caps, per-user cap, minimum purchase, maximum discount amount, active flag). `discount_events` is the many-to-many join scoping a coupon to specific Events/categories. `discount_redemptions` records each successful use, enforcing per-user and total usage limits.

### 2.10 session_attendance
One row per registration per Session. MVP: manual admin marking (present/absent/late/excused) plus join-timestamp logging from the protected join redirect. Future: Zoom API sync, duration calculation, minimum-attendance-percentage rule.

### 2.11 notifications
One row per notification instance sent to a user (in-app + email in MVP). Reminder rows must be unique on `(user_id, session_id, notification_type)` to prevent duplicate sends.

### 2.12 certificates
Unique certificate number, QR-based public verification token, eligibility linkage to a completed+attended registration, issue/revoke/reissue audit trail.

### 2.13 event_resources
Session-level or Event-level downloadable materials.

### 2.14 reviews
Student feedback/testimonials tied to a completed Event (feeds the public testimonials section).

### 2.15 audit_logs
Actor, action, target, timestamp, IP context where appropriate, and a safe change summary (no secrets). Written for every privileged admin action listed in `idea.md` §5.16.

### 2.16 settings
Singleton/key-value operational configuration: seat-hold duration, join-window configuration, default time zone, currency, certificate defaults, maintenance mode, etc.

## 3. Relationships

- One **instructor** can manage many **events** or **event_sessions**.
- One **event** contains many **event_sessions**.
- One **user** can register for many **events** (via `registrations`).
- One **event** has many **registrations**.
- One **registration** may have one or more **payment_transactions**.
- One **registration** has many **session_attendance** records (one per eligible Session).
- **discounts** may apply to one or many **events** (via `discount_events`).
- One completed **registration** may receive one **certificate**.

## 4. Constraints

| Constraint | Rule |
|---|---|
| Email | Unique per user |
| Event slug | Unique |
| Registration | Unique on `(user_id, event_id)` |
| Coupon code | Unique |
| Manual payment TrxID | Unique per `method` (`bkash` / `nagad`) in `payment_transactions` |
| Reminder | Unique on `(user_id, session_id, notification_type)` |
| Certificate number | Unique |
| Amounts | Prices and discount amounts must be non-negative |
| Capacity | Must be greater than zero when limited |
| Session timing | End time must be after start time |
| Registration window | Close time must not be after Event start, unless explicitly supported |
| Deletion rules | Foreign keys must protect financial history (no hard delete of paid registrations/payments) |

## 5. Concurrency & Integrity Rules

- Seat capacity checks, coupon redemption, and payment confirmation must run inside **database transactions** to prevent race conditions (e.g., two students confirming the last seat simultaneously).
- Active holds *and* confirmed registrations both count toward capacity when validating availability.
- Registration/payment amounts are **snapshotted** at transaction time and never recalculated from the live Event record.

## 6. ORM & Migrations

Prisma ORM owns `prisma/schema.prisma` as the single source of truth for the schema, with versioned migrations in `prisma/migrations/`. All the enums above (`EventStatus`, `SessionStatus`, `RegistrationStatus`, `SeatHoldStatus`, `PaymentStatus`) should be modeled as Prisma enums rather than free-text columns.
