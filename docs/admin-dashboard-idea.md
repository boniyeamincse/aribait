# Ariba IT — Admin Dashboard Idea

## 1. Dashboard Purpose

Ariba IT Admin Dashboard will be the operational control center for managing Events, multi-session live classes, students, seat bookings, payments, coupons, notifications, attendance, certificates and reports.

The design should help an Admin answer five questions immediately:

1. What is happening today?
2. Which Sessions are starting soon?
3. Are registrations and payments working?
4. Is any Event, payment or reminder waiting for action?
5. How are enrollment, attendance and revenue performing?

The dashboard must be responsive, fast, role-protected and optimized for daily administrative work.

---

## 2. Recommended Layout

```text
┌──────────────────────────────────────────────────────────────┐
│ Logo | Search | Quick Create | Notifications | Admin Profile│
├───────────────┬──────────────────────────────────────────────┤
│ Sidebar       │ Page Title / Breadcrumb / Page Actions      │
│               ├──────────────────────────────────────────────┤
│ Overview      │ Main Content                                 │
│ Events        │                                              │
│ Sessions      │                                              │
│ Calendar      │                                              │
│ Students      │                                              │
│ Registrations │                                              │
│ Payments      │                                              │
│ Discounts     │                                              │
│ Attendance    │                                              │
│ Certificates  │                                              │
│ Notifications │                                              │
│ Reports       │                                              │
│ Settings      │                                              │
└───────────────┴──────────────────────────────────────────────┘
```

### Top Bar

- Ariba IT logo
- Global search
- Quick Create button
- Today's date and Asia/Dhaka time
- Notification bell with unread counter
- Admin profile and logout

### Sidebar

- Collapsible desktop sidebar
- Mobile drawer navigation
- Icon and label for each module
- Active page indicator
- Badge for pending actions
- Permission-aware menu visibility

### Global Search

Admin should be able to search by:

- Event name or ID
- Session name
- Student name, email or phone
- Registration ID
- Transaction ID
- Coupon code
- Certificate number

Search results should be grouped by entity and must respect Admin permissions.

---

## 3. Dashboard Navigation

```text
Admin Dashboard
├── Overview
├── Events
│   ├── All Events
│   ├── Create Event
│   ├── Drafts
│   ├── Published
│   ├── Registration Open
│   ├── Ongoing
│   ├── Completed
│   ├── Cancelled
│   └── Archived
├── Sessions
│   ├── All Sessions
│   ├── Today
│   ├── Upcoming
│   ├── Live Now
│   ├── Completed
│   ├── Cancelled
│   └── Calendar
├── Students
├── Instructors
├── Registrations
├── Seats and Waitlist
├── Payments
├── Discounts and Coupons
├── Attendance
├── Certificates
├── Notifications
├── Reports
├── Audit Logs
└── Settings
```

---

## 4. Overview Dashboard

### 4.1 Primary KPI Cards

Top cards should show:

- Total Students
- Active Events
- Today's Sessions
- Upcoming Sessions
- Confirmed Registrations
- Seats Available
- Monthly Revenue
- Payment Success Rate

Each card should include:

- Current value
- Comparison with previous period
- Trend indicator
- Click-through link to the detailed module
- Loading, empty and error state

### 4.2 Action Required Panel

This panel is more important than decorative statistics. It should display:

- Payments awaiting review
- Failed reminder jobs
- Sessions missing meeting links
- Events starting soon with registration still open
- Nearly full Events
- Expired seat holds
- Students on waitlists
- Sessions awaiting completion
- Attendance awaiting finalization
- Certificates waiting to be issued

Each item must have a direct action button.

### 4.3 Today's Operations

Display all Sessions scheduled for today:

| Time | Session | Event | Platform | Students | Status | Action |
|---|---|---|---|---:|---|---|
| 8:00 PM | SIEM Fundamentals | SOC Bootcamp | Zoom | 28 | Scheduled | Open |

Available actions:

- View Session
- Copy protected Admin join link
- Open participant list
- Send announcement
- Mark live
- Complete Session
- Reschedule or cancel

### 4.4 Upcoming Sessions Timeline

Show the next 7 days with:

- Session date/time
- Event name
- Instructor
- Confirmed student count
- Join reminder state
- Meeting configuration state
- Session status

### 4.5 Recent Activity

- New registrations
- Successful payments
- Failed payments
- Coupon usage
- Admin changes
- Attendance updates
- Certificate issuance

### 4.6 Charts

Recommended charts:

- Registration trend: last 30 days
- Revenue trend: current versus previous month
- Free versus paid enrollments
- Seat utilization by Event
- Payment status distribution
- Session attendance trend

All charts should support a date filter and link to detailed reports.

### 4.7 Quick Actions

- Create Event
- Add Session
- Create Coupon
- Register Student
- Send Announcement
- Record Manual Payment
- Take Attendance
- Issue Certificate

---

## 5. Event Management Module

### 5.1 Event List Page

Table columns:

- Event thumbnail
- Title
- Type/category
- Instructor
- Number of Sessions
- Registration window
- Price
- Capacity and confirmed seats
- Status
- Publication state
- Actions

Filters:

- Keyword
- Status
- Category
- Instructor
- Free or paid
- Date range
- Registration open or closed
- Capacity state: available, nearly full or full

Row actions:

- View
- Edit
- Duplicate
- Manage Sessions
- Registrations
- Payments
- Send announcement
- Publish/unpublish
- Cancel
- Archive

Destructive or high-impact actions require confirmation and an optional reason.

### 5.2 Event Creation Wizard

A multi-step wizard is recommended:

```text
Step 1: Basic Information
Step 2: Instructor and Category
Step 3: Pricing and Capacity
Step 4: Registration Rules
Step 5: Sessions and Meeting Details
Step 6: Coupon Eligibility
Step 7: Content and SEO
Step 8: Review and Publish
```

#### Step 1 — Basic Information

- Title
- Auto-generated editable slug
- Short summary
- Full description
- Event type
- Thumbnail and banner
- Language
- Learning objectives
- Audience and prerequisites

#### Step 2 — Instructor and Category

- Category
- Primary instructor
- Optional co-instructors
- Instructor bio preview

#### Step 3 — Pricing and Capacity

- Free or paid
- Regular price
- Currency: BDT
- Seat limit
- Waitlist enabled
- Maximum enrollment per transaction, if applicable

#### Step 4 — Registration Rules

- Registration start and end date/time
- Email verification requirement
- Cancellation and refund policy
- Terms acceptance
- Seat hold duration for paid checkout

#### Step 5 — Sessions

Admin can add, remove, reorder or duplicate Sessions.

Each Session includes:

- Title
- Sequence number
- Date
- Start and end time
- Time zone
- Instructor
- Platform
- Meeting URL, ID and passcode
- Join opens before start
- Join closes after end
- Attendance requirement

#### Step 6 — Discounts

- Allow all valid coupons
- Allow selected coupons
- Disable coupons
- Event-specific promotional price

#### Step 7 — Content and SEO

- Page title and description
- Social sharing image
- Featured Event toggle
- Homepage placement

#### Step 8 — Review

The system should warn about:

- Missing Session
- Missing instructor
- Missing meeting details
- Invalid date order
- Registration ending after Event start
- Price without configured payment method
- Capacity lower than existing confirmed registrations

Admin can save as Draft or Publish.

### 5.3 Event Detail Page

Tabs:

```text
Overview | Sessions | Registrations | Payments | Attendance |
Notifications | Certificates | Activity Log | Settings
```

The Overview tab should show Event health, capacity, revenue, next Session and action-required warnings.

---

## 6. Session Management Module

### Session List

Columns:

- Date/time
- Session title
- Parent Event
- Instructor
- Platform
- Confirmed students
- Reminder status
- Meeting setup status
- Session status
- Actions

### Session Detail

- Schedule and countdown
- Parent Event summary
- Meeting configuration status
- Participant count
- Reminder delivery report
- Join attempt report
- Attendance panel
- Announcements
- Activity history

### Session Actions

- Edit schedule
- Change instructor
- Update meeting details
- Send reminder now
- Send announcement
- Mark live
- Mark completed
- Reschedule
- Cancel

When rescheduled or cancelled, Admin must provide a reason and the system should notify affected students.

---

## 7. Calendar Module

Views:

- Month
- Week
- Day
- Agenda

Features:

- Color by Event type or Session status
- Filter by instructor, category and platform
- Click a Session to open its detail drawer
- Detect instructor schedule conflicts
- Detect overlapping Sessions using the same managed meeting account
- Display registration closing deadlines
- Export calendar data where appropriate

---

## 8. Student Management Module

### Student List

Columns:

- Name
- Email
- Phone
- Verification status
- Total Events
- Completed Events
- Total paid
- Account status
- Joined date
- Last activity

Filters:

- Account status
- Verified/unverified
- Event
- Registration status
- Date joined
- Payment history

### Student Profile for Admin

Tabs:

- Profile
- Registrations
- Upcoming Sessions
- Payments
- Attendance
- Certificates
- Notifications
- Activity

Admin actions:

- Update allowed profile fields
- Resend verification email
- Register for an Event with authorization
- Cancel registration with reason
- Suspend/reactivate account
- Reset security sessions
- Add internal note

Sensitive information should be masked unless required by the Admin's permission.

---

## 9. Instructor Management Module

- Instructor profile CRUD
- Photo, name, title and bio
- Skills and social links
- Assigned Events and Sessions
- Upcoming schedule
- Availability notes
- Active/inactive status
- Session and attendance summary
- Conflict detection

An Instructor portal can be added later without changing the core data model.

---

## 10. Registration, Seat and Waitlist Module

### Registration List

Columns:

- Registration ID
- Student
- Event
- Registration time
- Original price
- Discount
- Final amount
- Payment status
- Seat status
- Registration status

Actions:

- View details
- Confirm authorized free/manual registration
- Cancel with reason
- Move to waitlist
- Promote from waitlist
- Resend confirmation
- View audit trail

### Seat Management

Show:

- Total capacity
- Confirmed seats
- Active temporary holds
- Available seats
- Waitlisted students
- Expired holds

Rules:

- Capacity changes must be validated server-side.
- Capacity cannot be reduced below confirmed seats.
- Temporary holds expire automatically.
- Waitlist promotion should be controlled and auditable.
- Overbooking prevention must use database transactions, not UI checks.

---

## 11. Payment Management Module

### Payment Overview

- Today's collections
- Monthly revenue
- Pending payments
- Failed payments
- Refund total
- Gateway success rate
- Unmatched or suspicious transactions

### Payment Table

- Transaction ID
- Student
- Event
- Amount
- Discount
- Final amount
- Provider
- Payment method
- Status
- Initiated/paid time
- Verification source

### Payment Detail

- Registration link
- Price snapshot
- Coupon snapshot
- Gateway references
- Webhook history
- Verification status
- Status timeline
- Receipt
- Audit log

Important rules:

- Browser-returned success must not confirm payment by itself.
- Gateway verification/webhook must be checked server-side.
- Duplicate webhooks must be idempotent.
- Manual confirmation requires permission, a reason and audit log.
- Secrets and full sensitive payloads must not appear in the UI or logs.

---

## 12. Discount and Coupon Module

### Coupon List

- Code
- Type
- Value
- Validity period
- Applicable Events
- Usage and limit
- Revenue impact
- Status

### Coupon Builder

- Code
- Percentage or fixed amount
- Start and expiry date/time
- Total usage limit
- Per-student limit
- Minimum purchase
- Maximum discount
- Selected Events/categories
- Active status

Dashboard warnings:

- Expiring soon
- Exhausted
- Invalid configuration
- Unusually high redemption
- Coupon reducing payable amount below zero

---

## 13. Notification Center

### Templates

- Registration confirmation
- Payment success/failure
- Session reminder
- Session rescheduled
- Session/Event cancelled
- Announcement
- Waitlist promotion
- Certificate issued
- Refund status

### Notification History

- Recipient
- Event/Session
- Channel
- Template
- Scheduled time
- Sent time
- Delivery status
- Failure reason
- Retry count

### Reminder Monitoring

Admin should see:

- Sessions starting within 24 hours
- Reminder scheduled/not scheduled
- Number of eligible students
- Sent, delivered and failed counts
- Duplicate prevention state
- Retry action for failed messages

The standard reminder will be scheduled 20 minutes before each Session.

---

## 14. Attendance Module

### Attendance Workspace

- Select Event and Session
- Search student
- Mark present, absent, late or excused
- Record joined and left time
- Calculate attendance duration
- Bulk update with safeguards
- Add Admin note
- Finalize attendance

### Attendance Rules

- Only confirmed students appear by default.
- Attendance changes after finalization require elevated permission.
- Overrides require a reason and audit log.
- Event completion percentage may be calculated from required Sessions.
- Future Zoom synchronization should not overwrite reviewed manual data without a conflict policy.

---

## 15. Certificate Module

- Eligible student queue
- Issue individually or in an approved batch
- Unique certificate number
- QR verification URL
- Preview certificate
- Download PDF
- Email certificate
- Revoke with reason
- Reissue with history
- Public verification status

Eligibility may require:

- Confirmed and completed registration
- Paid status where applicable
- Required attendance percentage
- All mandatory Sessions completed

---

## 16. Reports Module

### Operational Reports

- Event registrations
- Seat utilization
- Waitlist and expired holds
- Upcoming Session readiness
- Reminder delivery
- Attendance and completion
- Certificate eligibility

### Financial Reports

- Revenue by period
- Revenue by Event/category
- Free versus paid registration
- Payment success/failure
- Coupon impact
- Refund summary
- Gateway reconciliation

### Student Reports

- New students
- Active students
- Repeat enrollment
- Completion rate
- Attendance rate

### Report Controls

- Date range
- Event/category/instructor filter
- Status filter
- Compare period
- CSV export
- Server-side pagination
- Saved filter presets in a future release

---

## 17. Settings Module

Sections:

- General branding
- Contact and social information
- Default timezone and currency
- Registration settings
- Seat-hold duration
- Join-window defaults
- Payment providers
- Email sender and templates
- Meeting providers
- Certificate configuration
- Terms, privacy and refund policy
- Admin users and permissions
- Security settings
- Integration health
- Maintenance mode

Secrets should be configured through secure environment settings and must never be displayed after saving.

---

## 18. Admin Roles and Permissions

Although the MVP may begin with one `ADMIN` role, the authorization model should be extensible.

Suggested future roles:

| Role | Main Access |
|---|---|
| Super Admin | Full system and Admin management |
| Event Manager | Events, Sessions, registrations and attendance |
| Finance Admin | Payments, refunds and financial reports |
| Support Admin | Students, registrations and notifications |
| Instructor | Assigned Events, Sessions and attendance |
| Viewer/Auditor | Read-only reports and audit data |

Permission examples:

- `events.read`
- `events.create`
- `events.update`
- `events.publish`
- `events.cancel`
- `sessions.manage`
- `registrations.manage`
- `payments.read`
- `payments.confirm_manual`
- `refunds.manage`
- `attendance.manage`
- `certificates.issue`
- `reports.export`
- `settings.manage`
- `admins.manage`

All permissions must be checked server-side for pages, APIs, Server Actions and background operations.

---

## 19. Audit Logs

Audit entries should record:

- Actor
- Action
- Entity type and ID
- Safe before/after summary
- Timestamp
- Reason, when required
- IP/device context where appropriate
- Success or failure

High-risk actions requiring reason and confirmation:

- Cancel Event or Session
- Reduce capacity
- Change price after registrations exist
- Change meeting details near start time
- Manually confirm payment
- Process refund
- Modify finalized attendance
- Revoke certificate
- Suspend student/Admin
- Change integration or security settings

---

## 20. UX and Design Guidelines

### Visual Style

- Professional technology and education brand
- Clean white/light neutral background
- Primary brand color for actions
- Green for success/paid/completed
- Amber for pending/warning
- Red for failed/cancelled/destructive
- Blue or purple for scheduled/live learning states

### Component Standards

- Consistent page header and breadcrumbs
- Filter bar above all management tables
- Sortable and paginated tables
- Status badges with text and color
- Drawer for quick details
- Modal only for short confirmations
- Full page for complex forms
- Sticky action bar in long creation forms
- Autosave draft where safe
- Toast plus persistent error summary
- Skeleton loading states
- Helpful empty states with primary action

### Responsive Behavior

- Desktop: full sidebar and wide tables
- Tablet: collapsed sidebar and compact tables
- Mobile: navigation drawer and card-based rows
- Important actions remain reachable without horizontal scrolling

### Accessibility

- Keyboard navigation
- Visible focus indicators
- Proper labels and error messages
- Sufficient color contrast
- Status must not depend on color alone
- Confirmation dialogs must return focus correctly

---

## 21. Dashboard Route Plan

```text
/admin
/admin/events
/admin/events/new
/admin/events/[eventId]
/admin/events/[eventId]/edit
/admin/events/[eventId]/sessions
/admin/sessions
/admin/sessions/[sessionId]
/admin/calendar
/admin/students
/admin/students/[studentId]
/admin/instructors
/admin/registrations
/admin/registrations/[registrationId]
/admin/payments
/admin/payments/[paymentId]
/admin/discounts
/admin/attendance
/admin/certificates
/admin/notifications
/admin/reports
/admin/audit-logs
/admin/settings
```

---

## 22. Admin Dashboard MVP

The MVP Admin Dashboard should include:

1. Protected Admin layout and server-side authorization
2. Overview KPIs and action-required panel
3. Event CRUD with Draft/Publish workflow
4. Multiple Session management per Event
5. Calendar and today's Sessions
6. Student and instructor management
7. Registration, capacity and seat-hold visibility
8. Payment list, details and verified status
9. Coupon CRUD and usage
10. Twenty-minute reminder monitoring
11. Manual attendance
12. Basic certificate issuance
13. Registration and revenue reports
14. Audit logs for high-risk actions
15. General platform settings

Future Admin enhancements:

- Drag-and-drop advanced calendar
- Automated Zoom meeting creation
- Zoom attendance synchronization
- SMS/WhatsApp campaigns
- Advanced report builder
- Granular role management UI
- Bulk corporate enrollment
- Support ticket module
- Marketing automation

---

## 23. Recommended First Screen

When an Admin logs in, the initial screen should prioritize operations in this order:

```text
Header: Good evening, Admin | Today in Asia/Dhaka

KPI Row:
Students | Active Events | Today's Sessions | Monthly Revenue

Action Required:
Missing meeting links | Pending payments | Failed reminders | Waitlist

Today's Sessions:
Time | Session | Students | Reminder | Meeting | Action

Performance:
Registration Trend | Revenue Trend

Recent Activity:
Registrations | Payments | Admin changes
```

This design gives the Admin both a management dashboard and a daily operations console. The most important information—Sessions starting soon, students waiting, payment issues and reminder failures—remains visible before analytical charts.
