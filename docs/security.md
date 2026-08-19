# Ariba IT — Security

**Document type:** Security requirements and controls
**Related document:** [idea.md](./idea.md), [architecture.md](./architecture.md), [api.md](./api.md)

---

## 1. Core Principles

- Authorization is enforced **server-side** on every protected action. Hiding an Admin menu item in the frontend is never treated as authorization.
- Least privilege applies to database credentials and third-party integration credentials.
- Financial and registration data integrity takes precedence over convenience — snapshotting, transactions, and idempotency are non-negotiable in the payment/coupon/seat paths.

## 2. Authentication & Session Security

- Registration/login via Auth.js; passwords hashed with an established adaptive hashing algorithm (e.g. bcrypt/argon2 family).
- Session cookies: secure, HTTP-only, same-site.
- Email verification required before full account activation.
- Optional two-factor authentication for Admin accounts.
- Account status enum enforced at the auth layer: `pending`, `active`, `suspended`, `deactivated` — suspended/deactivated accounts are rejected at session validation, not just hidden in UI.
- Login and security-relevant events retained in an audit history.

## 3. Input Validation & Transport Security

- Every Server Action and Route Handler validates input against a strict Zod schema server-side, regardless of client-side validation.
- CSRF protection applied where relevant (Server Actions get built-in origin checks; any additional form-post routes must be covered explicitly).
- Rate limiting on: login, registration, coupon validation, and payment initiation.

## 4. Secure Live Class Join

Meeting links and passcodes are the platform's most sensitive operational data and must never appear on:

- Public Event pages
- Any unrestricted/public API response
- Client-side logs or analytics events
- Static HTML

Enforcement workflow:

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

- Route shape: `/dashboard/sessions/{sessionId}/join` — a server-side redirect, not a JSON field the client reads and follows.
- Meeting URLs and passcodes are **encrypted at rest** and decrypted only inside the join handler, immediately before the redirect response.
- A cancelled Session cannot be joined; a rescheduled Session invalidates the prior reminder/join expectations and issues a fresh notification.

## 5. Payment Security

**MVP method: manual bKash/Nagad.** There is no gateway signature to verify, so trust is anchored differently:

- A student-submitted payment proof (method, sender number, TrxID, optional screenshot) is never treated as confirmation on its own — only an explicit **admin approve action** moves a payment to `PAID` and a registration to `CONFIRMED`.
- Payment and registration confirmation happen together inside a single database transaction, exactly as a gateway-based flow would.
- The submitted TrxID is **unique per method**, so the same bKash/Nagad transaction cannot be reused to confirm more than one registration.
- Every approve/reject is written to the audit log with the reviewing admin, timestamp, and outcome — this is the accountability control standing in for a provider signature.
- The designated receiving number (`01914638653`) is intentionally public-facing (shown to students at checkout) — it is operational contact information, not a secret, and must not be confused with credential-type secrets below.
- The payment adapter interface still isolates this manual flow from registration/seat business logic, so a future real gateway (with server-side webhook signature verification, idempotent webhook handling, and provider secrets `PAYMENT_API_KEY` / `PAYMENT_SECRET` / `PAYMENT_WEBHOOK_SECRET`) can replace it without touching that logic.

## 6. Seat & Coupon Integrity

- Seat capacity checks, holds, and confirmations run inside database transactions to prevent concurrent overbooking.
- Coupon validation re-checks, at redemption time: active status, validity window, total usage cap, per-user usage cap, Event/category eligibility, minimum purchase amount — and guarantees the final payable amount never goes negative.
- Registration and payment amounts are stored as **immutable snapshots**; later Event price or discount changes never retroactively alter historical transactions.

## 7. Data Protection

- Private files (certificates, uploaded resources) use signed or otherwise authorized access — never public S3-style URLs by default.
- Sensitive integration credentials (Zoom, payment, storage) are encrypted/managed as environment variables, scoped per environment (development/preview/production).
- Personal and financial data have defined retention/deletion rules.
- Public certificate verification pages expose only what's necessary to confirm authenticity — not full student PII.

## 8. Audit Logging

Privileged actions recorded with actor, action, target, timestamp, IP context where appropriate, and a safe change summary (no secrets in the log body):

- Event creation and publication
- Price, capacity, and schedule changes
- Session meeting-link changes
- Registration status changes
- Manual payment confirmation
- Refund actions
- Attendance overrides
- Certificate issue or revocation
- User suspension
- Settings changes

Audit logs are treated as tamper-resistant (append-only from the application's perspective; no update/delete path exposed to Admin UI).

## 9. Environment & Secrets Management

```text
DATABASE_URL=
DIRECT_DATABASE_URL=
AUTH_SECRET=
NEXT_PUBLIC_APP_URL=

PAYMENT_PROVIDER=
PAYMENT_API_KEY=
PAYMENT_SECRET=
PAYMENT_WEBHOOK_SECRET=

EMAIL_API_KEY=
EMAIL_FROM=

ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=

STORAGE_ENDPOINT=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
STORAGE_BUCKET=

CRON_SECRET=
```

Rules:
- Secrets never committed to Git.
- Only variables explicitly intended for the browser use a public prefix (`NEXT_PUBLIC_*`); all secrets stay server-only.
- Separate values maintained per environment: development, preview, production.
- `CRON_SECRET` gates all `app/api/cron/*` routes against unauthenticated invocation.

## 10. Operational Security

- Database backups taken regularly, with restoration tested (not just assumed to work).
- Production logging/monitoring in place to detect abnormal auth, payment, or admin-action patterns.
- Health checks and operational alerts configured for the deployed environment.
