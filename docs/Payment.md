# Instructor Earnings and Manual Payment Feature

## Business Model

* Admin creates and manages Instructor accounts.
* Instructor creates their own events and sessions.
* Students make payments to the Admin/platform.
* Instructor receives **60%** of each eligible student payment.
* Platform/Admin keeps the remaining **40%**.
* Instructor earnings become available only after the student completes the required session/event.
* Admin pays the Instructor manually.
* The system only records earnings, balance and manual payment history.

## Earnings Calculation

```text
Instructor Earnings = Student Paid Amount × 60%
Admin Commission = Student Paid Amount × 40%
```

### Example

If one student pays **৳1,000**:

| Distribution              | Amount |
| ------------------------- | -----: |
| Student Payment           | ৳1,000 |
| Instructor Earnings — 60% |   ৳600 |
| Admin Commission — 40%    |   ৳400 |

If 10 students complete the event:

```text
Total Instructor Earnings = 10 × ৳600 = ৳6,000
```

---

# Earning Eligibility Rule

Instructor earnings are created only when:

* Student payment status is `PAID`.
* Student registration is `CONFIRMED`.
* Student completes the required session or event.
* Registration is not cancelled.
* Payment is not refunded.
* Earnings have not already been generated for that registration.

Recommended earning status:

| Status      | Meaning                                         |
| ----------- | ----------------------------------------------- |
| `PENDING`   | Student paid, but training is not completed     |
| `AVAILABLE` | Completion confirmed; amount added to balance   |
| `PAID`      | Admin paid the instructor                       |
| `CANCELLED` | Registration cancelled                          |
| `REVERSED`  | Earning removed because of refund or correction |

---

# Completion Rule

Because one event has multiple sessions, use one of these policies:

* Student completes all required sessions; or
* Student meets the minimum attendance requirement, such as 75%.

After event completion:

```text
Payment Paid
+ Registration Confirmed
+ Attendance Requirement Met
= Instructor Earning Available
```

The system must not calculate the 60% separately after every session if the student paid one price for the complete event. It should calculate earnings once per paid registration after event completion.

---

# Instructor Balance

Display these values in the Instructor Dashboard:

| Balance           | Description                          |
| ----------------- | ------------------------------------ |
| Pending Earnings  | Paid registrations not yet completed |
| Available Balance | Completed and eligible earnings      |
| Total Paid        | Total amount already paid by Admin   |
| Lifetime Earnings | Available balance plus total paid    |

### Calculation

```text
Available Balance =
Total Available Earnings
− Total Completed Instructor Payments
```

Example:

```text
Available Earnings: ৳10,000
Admin Paid:          ৳4,000
Current Balance:     ৳6,000
```

When Admin records another payment of ৳2,000:

```text
Previous Balance: ৳6,000
Payment:          ৳2,000
New Balance:      ৳4,000
```

---

# Instructor Dashboard Menu

```text
Dashboard
My Events
Sessions
Students
Attendance
Earnings
  ├── Earnings Summary
  ├── Pending Earnings
  ├── Available Balance
  └── Payment History
Profile
Notifications
```

## Instructor earnings cards

* Pending Earnings
* Available Balance
* Total Paid
* Lifetime Earnings

Instructor can view payment history but cannot create, edit or delete payment records.

---

# Admin Dashboard Menu

```text
Instructor Management
  ├── All Instructors
  ├── Create Instructor
  ├── Instructor Events
  └── Instructor Status

Instructor Finance
  ├── Earnings Overview
  ├── Instructor Balances
  ├── Record Payment
  └── Payment History
```

---

# Admin Manual Payment Workflow

1. Admin opens **Instructor Balances**.
2. Admin selects an Instructor.
3. System displays:

   * Pending earnings
   * Available balance
   * Previously paid amount
   * Payment history
4. Admin clicks **Record Payment**.
5. Admin enters:

   * Payment amount
   * Payment date
   * Payment method
   * Transaction/reference number
   * Payment note
6. System validates that the payment does not exceed the available balance.
7. Admin confirms the payment.
8. System records the transaction.
9. Instructor’s available balance decreases.
10. Instructor receives a notification.

---

# Manual Payment Methods

* Cash
* Bank Transfer
* Mobile Banking
* bKash
* Nagad
* Rocket
* Other

The system does not send money automatically. It only records that Admin paid the Instructor externally.

---

# Important Business Rules

* Admin creates Instructor accounts.
* Default Instructor share is 60%.
* The commission percentage should be stored with the event or earning record.
* Instructor cannot change their earning percentage.
* Student payments belong to the platform until earnings become eligible.
* Instructor balance cannot become negative.
* Admin cannot record a payment greater than the available balance.
* Every earning must be generated only once per registration.
* Every manual payment requires a transaction/reference number.
* Instructor payment records cannot be permanently deleted.
* Corrections must use a reversal or adjustment record.
* Refunded student payments must not generate Instructor earnings.
* All earning, adjustment and payment actions must have audit logs.

---

# Recommended Records

## Instructor earning

```text
Instructor
Event
Registration
Student Payment
Gross Amount
Instructor Percentage
Instructor Amount
Platform Amount
Status
Available Date
Created Date
```

## Instructor payment

```text
Instructor
Payment Amount
Payment Date
Payment Method
Reference Number
Payment Note
Recorded By Admin
Status
Created Date
```

## Recommended ledger

Maintain an immutable balance ledger:

| Transaction         |  Balance Effect |
| ------------------- | --------------: |
| Eligible earning    |      Credit `+` |
| Admin payment       |       Debit `−` |
| Refund reversal     |       Debit `−` |
| Approved adjustment | Credit or debit |

Never save only a manually editable balance value. Calculate the current balance from the ledger to prevent incorrect or manipulated balances.
