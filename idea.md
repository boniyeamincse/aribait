# Ariba IT

## Live Class, Training and Event Registration Platform

**Document type:** Project idea and product blueprint  
**Project name:** Ariba IT  
**Primary market:** Bangladesh  
**Platform:** Responsive web application  
**Recommended deployment:** Vercel with Neon PostgreSQL

---

## 1. Project Overview

Ariba IT will be a complete online platform for publishing, selling and managing live classes, professional training programs, workshops, seminars and other online events.

The platform will use one unified **Event** model. An Event is a bookable program that may contain one or more scheduled online **Sessions**. A student registers for the Event once and, after confirmation, can access all permitted sessions from the student dashboard at the scheduled time.

Examples of Events:

- A one-session free cybersecurity webinar
- A three-session paid SOC Fundamentals course
- A seven-day Linux administration bootcamp
- A career workshop hosted through Zoom
- A recurring professional training program

### Core Concept

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

---

## 2. Project Goals

- Provide one platform for free and paid online programs.
- Allow students to discover, register and securely join live sessions.
- Let administrators manage the complete event lifecycle from one dashboard.
- Prevent overbooking through controlled seat reservation.
- Protect meeting links from public exposure.
- Notify registered students before every live session.
- Track registration, payment, attendance and completion.
- Support future expansion into certificates, recorded courses and mobile apps.

---

## 3. User Roles

### 3.1 Student/User

A student will be able to:

- Create and verify an account
- Browse published Events and training programs
- Search and filter Events
- View schedules, instructors, fees and available seats
- Register instantly for a free Event
- Reserve a seat and pay for a paid Event
- Apply a valid discount or coupon
- View confirmed enrollments
- Receive session reminders
- Join Zoom, Google Meet, Microsoft Teams or a custom meeting platform
- View attendance and completion status
- Download certificates when eligible
- View payment receipts and registration history
- Manage profile, password and notification preferences

### 3.2 Admin

An administrator will be able to:

- Manage the entire platform
- Create, update, publish, cancel and complete Events
- Add one or more Sessions under an Event
- Manage instructors, categories and schedules
- Configure capacity, pricing and registration windows
- Create coupons and Event-specific discounts
- Review registrations and payments
- Confirm authorized manual payments when supported
- Monitor seat availability and expired reservations
- Manage session attendance
- Send announcements and notifications
- Issue and revoke certificates
- View financial and operational reports
- Manage users, roles and settings
- Review administrative audit logs

### 3.3 Instructor — Phase 2

An optional Instructor role may be introduced later. An instructor could:

- View assigned Events and Sessions
- Access participant lists where authorized
- Start or open a scheduled session
- Mark or review attendance
- Upload class resources
- Submit completion feedback

---

## 4. Primary Business Model

### Event and Session Relationship

An **Event** represents the program a student books. A **Session** represents an individual scheduled live class within that Event.

Example:

```text
Event: SOC Fundamentals Bootcamp
Price: ৳1,000
Capacity: 30 students

Sessions:
1. Introduction to SOC — 10 September, 8:00 PM
2. SIEM Fundamentals — 12 September, 8:00 PM
3. Alert Investigation — 14 September, 8:00 PM
```

The student registers only once for the Event. After confirmation, all eligible Sessions appear in the student's profile. Each Session has its own date, time, duration, platform, protected meeting link and completion status.

---

## 5. Main Software Modules

## 5.1 Public Website Module

Public pages:

- Home
- All Events
- Live Classes
- Training Programs
- Event details
- Schedule/calendar
- Instructor profiles
- About Ariba IT
- Contact
- Frequently Asked Questions
- Terms and Conditions
- Privacy Policy
- Refund Policy
- Login
- Registration

Home page sections:

- Hero and primary call to action
- Upcoming Events
- Upcoming live classes
- Featured training
- Free learning opportunities
- Paid professional programs
- Popular categories
- Featured instructors
- Special offers
- Student testimonials
- Newsletter subscription

Event discovery features:

- Keyword search
- Category filter
- Free/paid filter
- Date filter
- Instructor filter
- Event type filter
- Registration status filter
- Sorting by newest, upcoming, popular or price

## 5.2 Authentication and Account Module

- Email and password registration
- Email verification
- Secure login and logout
- Forgot and reset password
- Optional Google sign-in in a later release
- Role-based access control
- Session management
- Account status: pending, active, suspended or deactivated
- Optional two-factor authentication for Admin accounts
- Login and security audit history

## 5.3 Event Management Module

Event properties:

- Title and slug
- Short and full description
- Event type
- Category
- Instructor
- Thumbnail and banner
- Learning objectives
- Intended audience
- Prerequisites
- Language
- Capacity
- Price and currency
- Registration opening and closing time
- Event start and end time
- Featured status
- Terms and refund rules
- Publication status

Event statuses:

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

## 5.4 Live Session Management Module

Each Event may contain one or many Sessions.

Session properties:

- Session title and sequence number
- Description and agenda
- Start and end date/time
- Time zone
- Instructor or host
- Platform: Zoom, Google Meet, Microsoft Teams or custom
- Meeting ID
- Protected meeting URL
- Protected passcode
- Join-window configuration
- Attendance rule
- Session resources
- Session status

Session statuses:

```text
SCHEDULED
JOIN_OPEN
LIVE
COMPLETED
CANCELLED
RESCHEDULED
```

Default join rule:

- Join button becomes active 20 minutes before the Session.
- Join remains available until 15 minutes after the scheduled end time.
- Only a confirmed and eligible student can use the join action.
- A cancelled Session cannot be joined.
- Rescheduling triggers a new student notification.

## 5.5 Registration and Seat Booking Module

Registration features:

- Free enrollment
- Paid enrollment
- Unique registration per student and Event
- Capacity validation
- Temporary seat hold during checkout
- Waitlist when capacity is full
- Registration cancellation under applicable policy
- Admin registration and status management
- Registration confirmation email and in-app message

Registration statuses:

```text
PENDING_PAYMENT
CONFIRMED
WAITLISTED
CANCELLED
EXPIRED
REFUNDED
COMPLETED
```

Seat statuses:

```text
AVAILABLE → HELD → CONFIRMED
                 ↘ EXPIRED
```

Recommended rules:

- A paid checkout holds a seat for 15 minutes.
- A successful verified payment confirms the seat.
- An expired or failed checkout releases the seat.
- Active holds and confirmed registrations count toward capacity.
- Database transactions must be used to prevent concurrent overbooking.
- One student cannot register twice for the same Event.

## 5.6 Payment Module

**MVP payment method: manual bKash/Nagad.** Automated gateway integration is deferred; the application should not tie business logic directly to one gateway so a real gateway adapter can replace this flow later without a rewrite.

Manual payment flow:

- Platform displays the designated receiving number for bKash and Nagad (personal, Send Money type): **01914638653**.
- Student sends the exact payable amount from their own bKash/Nagad app to that number.
- Student submits payment proof in-app: payment method (bKash/Nagad), sender number, transaction ID (TrxID), optional screenshot.
- Submission creates a `PENDING` payment tied to the registration; the seat stays on hold.
- Admin reviews the submitted proof in the Payments queue and either **approves** or **rejects** it.
- Approval confirms the payment (`PAID`) and the registration (`CONFIRMED`) atomically, converts the seat hold to confirmed, and sends receipt + confirmation.
- Rejection keeps the registration unconfirmed (or cancels it per policy) and notifies the student with a reason, so they can resubmit.
- Every approval/rejection is written to the audit log with the reviewing admin, timestamp, and outcome.

Payment capabilities:

- Free checkout with zero payment
- Manual paid checkout in BDT via bKash/Nagad (MVP)
- Gateway abstraction to allow a real provider to replace the manual flow later
- Server-side (admin-reviewed) payment verification
- Idempotent transaction handling — a given TrxID can confirm only one registration
- Payment receipt
- Failed, rejected and cancelled payment handling
- Refund tracking in a later phase
- Payment reconciliation report

Payment statuses:

```text
INITIATED
PENDING
PAID
FAILED
CANCELLED
REFUNDED
PARTIALLY_REFUNDED
```

A submitted manual payment starts `PENDING`; admin action moves it to `PAID` (approve) or `FAILED` (reject). Automated gateway providers (online payment initiation, webhook processing) can be evaluated and layered in during a later implementation phase behind the same adapter interface.

## 5.7 Discount and Coupon Module

Coupon properties:

- Unique coupon code
- Percentage or fixed discount
- Start and expiry time
- Maximum total usage
- Per-user usage limit
- Minimum purchase amount
- Maximum discount amount
- Applicable Events or categories
- Active/inactive status

Required validations:

- Coupon exists and is active
- Current time is within its validity window
- Usage limit has not been exceeded
- Student has not exceeded the personal limit
- Event is eligible
- Minimum purchase is satisfied
- Final payable amount never becomes negative

The applicable price and discount must be stored as immutable registration/payment snapshots so later Event price changes do not modify historical transactions.

## 5.8 Student Dashboard Module

Dashboard menu:

```text
Dashboard
├── Overview
├── My Events
├── My Sessions
├── Upcoming Classes
├── Training Calendar
├── Notifications
├── Attendance
├── Certificates
├── Payments and Receipts
├── Coupons
├── Profile
├── Security
└── Logout
```

Dashboard overview cards:

- Total enrolled Events
- Upcoming Sessions
- Completed Events
- Earned certificates
- Unread notifications
- Outstanding or pending payments

The upcoming Session card will show:

- Event and Session name
- Instructor
- Date, time and time zone
- Countdown
- Platform
- Join availability
- Join Live Class button

## 5.9 Admin Dashboard Module

Admin navigation:

```text
Admin Dashboard
├── Overview
├── Events
│   ├── All Events
│   ├── Create Event
│   ├── Drafts
│   ├── Upcoming
│   ├── Ongoing
│   ├── Completed
│   └── Cancelled
├── Sessions
├── Schedule Calendar
├── Students
├── Instructors
├── Registrations
├── Seat and Waitlist Management
├── Payments
├── Discounts and Coupons
├── Attendance
├── Certificates
├── Notifications
├── Reports
├── Audit Logs
└── Settings
```

Admin overview:

- Total students
- Active Events
- Upcoming Sessions
- Confirmed registrations
- Available seats
- Total and monthly revenue
- Pending payments
- Recent registrations
- Recent payments
- Registration trend
- Revenue trend
- Upcoming Session list

## 5.10 Notification Module

Notification channels:

- In-app notification
- Email
- SMS or WhatsApp in a future phase
- Web/mobile push in a future phase

Automatic notification events:

- Account verification
- Registration confirmation
- Payment success or failure
- Session reminder 20 minutes before start
- Session rescheduled
- Session or Event cancelled
- New announcement
- Waitlist seat available
- Certificate issued
- Refund update

Session reminder workflow:

```text
Scheduled job runs every 5 minutes
        ↓
Find Sessions starting in the reminder window
        ↓
Find confirmed eligible students
        ↓
Create one notification per student and Session
        ↓
Send in-app notification and email
        ↓
Record sent or failed status
```

A uniqueness rule such as `(user_id, session_id, notification_type)` will prevent duplicate reminders.

## 5.11 Secure Live Class Join Module

Meeting links must never be displayed on a public Event page or returned from an unrestricted API.

Recommended workflow:

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

The protected route may use a structure such as:

```text
/dashboard/sessions/{sessionId}/join
```

Meeting URLs and passcodes should be encrypted at rest. They must not be included in public pages, static HTML, client logs or analytics events.

## 5.12 Attendance Module

MVP attendance:

- Admin manual attendance marking
- Present, absent, late or excused status
- Join timestamp logging from the protected redirect
- Session-wise and Event-wise attendance report

Future attendance:

- Zoom API attendance synchronization
- Meeting duration calculation
- Minimum attendance percentage
- Automated certificate eligibility
- Manual override with audit logging

## 5.13 Certificate Module

- Certificate template management
- Unique certificate number
- QR-based public verification
- Eligibility based on Event completion and attendance
- PDF generation
- Student download
- Admin issue, revoke and reissue operations
- Public verification page without exposing unnecessary student data

## 5.14 Reports and Analytics Module

Reports:

- Registration by Event and date
- Free versus paid enrollment
- Seat utilization
- Registration conversion
- Revenue by Event, category and period
- Discount usage
- Payment success/failure
- Attendance and completion
- Student activity
- Instructor performance summary
- Certificate issuance

Exports:

- CSV
- Excel in a later phase
- PDF summaries in a later phase

## 5.15 Content and Settings Module

- Site name, logo and branding
- Contact details and social links
- Homepage section management
- Terms, privacy and refund policies
- Email templates
- Notification templates
- Default time zone
- Currency and tax settings
- Seat-hold duration
- Join-window configuration
- Certificate defaults
- Maintenance mode

## 5.16 Audit and Activity Log Module

Important administrative actions should be recorded:

- Event creation and publication
- Price, capacity and schedule changes
- Session meeting-link changes
- Registration status changes
- Manual payment confirmation
- Refund actions
- Attendance overrides
- Certificate issue or revocation
- User suspension
- Settings changes

Each log should include actor, action, target, timestamp, IP context where appropriate and a safe change summary without storing secrets.

---

## 6. End-to-End Workflows

## 6.1 Admin Event Creation Workflow

```text
Admin Login
    ↓
Create Event
    ↓
Add information, category and instructor
    ↓
Set capacity, registration window and price
    ↓
Add one or more Sessions
    ↓
Configure platform and protected meeting details
    ↓
Optionally attach a discount
    ↓
Preview
    ↓
Publish and open registration
```

## 6.2 Free Event Registration Workflow

```text
Student opens Event
    ↓
System checks registration window and capacity
    ↓
Student clicks Register Free
    ↓
System creates confirmed registration atomically
    ↓
Seat becomes confirmed
    ↓
Confirmation notification is sent
    ↓
Sessions appear in Student Dashboard
```

## 6.3 Paid Event Registration Workflow (Manual bKash/Nagad — MVP)

```text
Student opens Event
    ↓
System checks registration window and capacity
    ↓
Student starts checkout
    ↓
Seat is held temporarily
    ↓
Coupon is validated and payable amount calculated
    ↓
Student is shown the bKash/Nagad receiving number (01914638653) and exact amount
    ↓
Student sends money via their own bKash/Nagad app
    ↓
Student submits payment proof (method, sender number, TrxID, optional screenshot)
    ↓
Admin reviews proof in the Payments queue
    ↓
Admin approves ──→ Payment and registration confirmed atomically ──→ Receipt and confirmation issued ──→ Sessions appear in Student Dashboard
    ↓
Admin rejects ──→ Registration stays unconfirmed ──→ Student notified with reason ──→ Student may resubmit
```

A future phase may add a real gateway (secure hosted payment, server-verified callback/webhook) behind the same payment adapter interface, without changing the registration/seat logic.

## 6.4 Live Session Workflow

```text
Session scheduled
    ↓
20-minute reminder sent to confirmed students
    ↓
Join button becomes active
    ↓
Student clicks Join
    ↓
Server checks identity, registration and time window
    ↓
Student is redirected to the meeting platform
    ↓
Join attempt/attendance evidence is recorded
    ↓
Admin completes the Session
```

## 6.5 Event Completion Workflow

```text
All required Sessions completed
    ↓
Attendance reviewed
    ↓
Event marked Completed
    ↓
Eligible registrations marked Completed
    ↓
Certificates generated or approved
    ↓
Students receive completion notification
```

## 6.6 Cancellation or Rescheduling Workflow

- Admin provides a reason.
- Affected students receive immediate notification.
- A rescheduled Session updates its join window and reminder schedule.
- Duplicate old reminders are cancelled or ignored.
- Event cancellation follows the configured refund policy.
- All changes are recorded in the audit log.

---

## 7. Recommended Technology Stack

### Application

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js with App Router | Full-stack web application |
| Language | TypeScript | Type safety and maintainability |
| UI | React | Interactive user interface |
| Styling | Tailwind CSS | Responsive design system |
| Components | shadcn/ui | Accessible reusable components |
| Forms | React Hook Form | Form state and submission |
| Validation | Zod | Shared server/client validation |
| Authentication | Auth.js | Authentication and session handling |
| Database | Neon PostgreSQL | Managed serverless relational database |
| ORM | Prisma ORM | Schema, migrations and typed data access |
| Hosting | Vercel | Next.js deployment and scheduled jobs |
| File storage | S3-compatible object storage | Images, resources and certificates |
| Email | Transactional email provider | Verification, reminders and receipts |
| Monitoring | Error and performance monitoring service | Production observability |

### Integration Architecture

```text
Browser
   ↓
Next.js on Vercel
   ├── Public and dashboard UI
   ├── Server Actions / Route Handlers
   ├── Authentication and authorization
   ├── Payment abstraction
   ├── Notification service
   └── Scheduled reminder job
           ↓
      Neon PostgreSQL
```

### Deployment Flow

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

---

## 8. Proposed Database Entities

Core entities:

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

### Important Relationships

- One instructor can manage many Events or Sessions.
- One Event contains many Sessions.
- One user can register for many Events.
- One Event has many registrations.
- One registration may have one or more payment transaction attempts.
- One registration has many Session attendance records.
- Discounts may apply to one or many Events.
- One completed registration may receive one certificate.

### Important Constraints

- Unique user email
- Unique Event slug
- Unique registration on `(user_id, event_id)`
- Unique coupon code
- Unique reminder on `(user_id, session_id, notification_type)`
- Unique certificate number
- Non-negative prices and discount amounts
- Capacity must be greater than zero when limited
- Session end time must be after start time
- Registration close time must not be after the Event starts unless explicitly supported
- Foreign keys and deletion rules must protect financial history

---

## 9. Suggested Application Structure

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
    ├── idea.md
    ├── architecture.md
    ├── database.md
    ├── api.md
    ├── security.md
    └── deployment.md
```

---

## 10. Security Requirements

- Enforce authorization on the server for every protected action.
- Hiding Admin menus in the frontend is not sufficient authorization.
- Use secure, HTTP-only and same-site session cookies.
- Hash passwords with an established adaptive password hashing algorithm.
- Require strong Admin authentication and optionally MFA.
- Validate all input using a strict schema.
- Apply CSRF protection where relevant.
- Rate-limit login, registration, coupon and payment endpoints.
- Verify payment callbacks/webhooks using provider signatures.
- Make webhook handling idempotent.
- Never trust payment success values returned only by the browser.
- Encrypt meeting links, passcodes and sensitive integration credentials.
- Keep meeting data out of public APIs, logs and analytics.
- Use signed or authorized access for private files.
- Use database transactions for capacity, coupon redemption and payment confirmation.
- Keep secrets only in managed environment variables.
- Maintain separate development, preview and production environments.
- Record privileged actions in tamper-resistant audit logs.
- Back up the database and test restoration.
- Use least-privilege database and integration credentials.
- Define retention and deletion rules for personal and financial data.

---

## 11. Environment Variables

Example names only:

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

Secrets must never be committed to the Git repository or exposed through public environment variable prefixes.

---

## 12. Non-Functional Requirements

### Performance

- Responsive pages on mobile and desktop
- Optimized images and caching
- Server-side pagination for large Admin tables
- Efficient indexed database queries
- Background processing for non-blocking notifications where needed

### Reliability

- Idempotent payment and notification jobs
- Retry strategy for email and webhook failures
- Safe database migrations
- Production logging and monitoring
- Health checks and operational alerts

### Accessibility

- Keyboard-friendly navigation
- Accessible form labels and error messages
- Sufficient color contrast
- Semantic page structure
- Screen-reader-friendly controls

### Localization

- Initial English or Bangla interface based on product decision
- Architecture ready for both Bangla and English
- Default time zone: Asia/Dhaka
- Currency: BDT
- Store date/time values consistently and convert for display

### Scalability

- Stateless application deployment
- Relational database constraints as the source of truth
- Modular payment, notification and meeting-platform adapters
- Queue/background service can be introduced when usage grows

---

## 13. MVP Scope

The first production-ready version should include:

1. Public website and Event discovery
2. Student registration, login and email verification
3. Admin role and protected dashboard
4. Event CRUD
5. Multiple Sessions per Event
6. Training schedule/calendar
7. Capacity and seat management
8. Free registration
9. Paid registration and verified payment
10. Coupon and discount system
11. Student dashboard
12. Protected live Session join
13. Twenty-minute in-app and email reminder
14. Registration and payment management
15. Manual attendance
16. Basic operational and revenue reports
17. Audit logs for critical Admin actions

Items intentionally deferred from the MVP:

- Automated Zoom meeting creation
- Automated Zoom attendance synchronization
- SMS and WhatsApp notification
- Advanced certificate designer
- Recorded course/LMS capability
- Native mobile application
- Multi-instructor portal
- Advanced refunds and accounting integration

---

## 14. Product Roadmap

### Phase 1 — Foundation

- Project setup and design system
- Database and migrations
- Authentication and role authorization
- Public website
- Admin and student dashboard shells

### Phase 2 — Event and Enrollment MVP

- Event and Session management
- Calendar and schedules
- Free enrollment
- Capacity and seat holds
- Student Event and Session views

### Phase 3 — Commerce

- Payment gateway adapter
- Verified payment and webhook handling
- Coupons and discounts
- Receipts and reconciliation

### Phase 4 — Live Delivery

- Protected Session join
- Twenty-minute reminders
- Announcements
- Manual attendance
- Completion workflow

### Phase 5 — Certificates and Reporting

- Certificate generation and verification
- Attendance eligibility rules
- Reports and exports
- Operational analytics

### Future Expansion

- Instructor portal
- Zoom API automation
- SMS, WhatsApp and push notification
- Recorded video courses
- Assignments, quizzes and learning resources
- Corporate/bulk enrollment
- Organization accounts
- Subscription or membership plans
- Referral and affiliate program
- Mobile applications
- AI learning assistant and recommendations

---

## 15. Success Metrics

- Number of verified students
- Event page to registration conversion rate
- Paid checkout completion rate
- Seat utilization rate
- Payment success rate
- Session attendance rate
- Event completion rate
- Certificate eligibility and issuance rate
- Reminder delivery success rate
- Repeat enrollment rate
- Refund/cancellation rate
- Monthly revenue
- Student satisfaction score

---

## 16. Key Product Decisions

1. **Event is the bookable product; Session is the scheduled live class.**
2. A student registers once for an Event and receives access to its eligible Sessions.
3. Free and paid Events share the same Event model and enrollment workflow.
4. Paid seats are confirmed only after server-verified payment.
5. Temporary seat holds and database transactions prevent overbooking.
6. Meeting links remain private and are accessed through a protected join route.
7. Every Session sends its own reminder 20 minutes before start.
8. Payment, notification and meeting platforms use adapter interfaces so providers can change.
9. Financial and registration snapshots preserve historical accuracy.
10. Security authorization is enforced by the server, not by frontend visibility.

---

## 17. Final Product Vision

Ariba IT will be more than an Event listing website. It will manage the complete journey from discovery to verified enrollment, scheduled live participation, attendance, completion and certification.

The central experience is:

```text
Discover Event
    ↓
Register and Book Seat
    ↓
Pay Securely when Required
    ↓
Receive Confirmation and Reminder
    ↓
Join Scheduled Live Sessions
    ↓
Complete Training
    ↓
Receive Attendance Record and Certificate
```

This unified architecture provides a focused MVP while leaving a clean path toward a complete learning management, professional training and online Event platform.
