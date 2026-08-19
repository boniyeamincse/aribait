import {
  getAttendanceCompletion,
  getCertificateIssuance,
  getDiscountUsage,
  getInstructorPerformance,
  getPaymentSuccessRate,
  getPricingSplit,
  getRegistrationsByEvent,
  getRevenueByEvent,
} from "@/lib/reports/queries";
import { Button } from "@/components/ui/button";
import { formatBdt } from "@/lib/utils";

export default async function AdminReportsPage() {
  const [
    registrationsByEvent,
    pricingSplit,
    revenueByEvent,
    paymentRates,
    discountUsage,
    attendanceCompletion,
    certificates,
    instructorPerformance,
  ] = await Promise.all([
    getRegistrationsByEvent(),
    getPricingSplit(),
    getRevenueByEvent(),
    getPaymentSuccessRate(),
    getDiscountUsage(),
    getAttendanceCompletion(),
    getCertificateIssuance(),
    getInstructorPerformance(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <Button
          size="sm"
          variant="outline"
          render={<a href="/api/admin/reports/registrations-csv">Export registrations CSV</a>}
        />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Registrations by Event</h2>
        <div className="divide-y rounded-lg border text-sm">
          {registrationsByEvent.length === 0 && (
            <p className="p-4 text-muted-foreground">No Events yet.</p>
          )}
          {registrationsByEvent.map((row) => (
            <div key={row.eventId} className="flex items-center justify-between gap-4 p-3">
              <span className="font-medium">{row.title}</span>
              <span className="text-muted-foreground">
                {row.confirmed} confirmed · {row.waitlisted} waitlisted ·{" "}
                {row.completed} completed · {row.cancelled} cancelled
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Free vs Paid Enrollment</h2>
        <p className="text-sm text-muted-foreground">
          {pricingSplit.free} free · {pricingSplit.paid} paid confirmed registrations
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Revenue by Event</h2>
        <div className="divide-y rounded-lg border text-sm">
          {revenueByEvent.length === 0 && (
            <p className="p-4 text-muted-foreground">No paid payments yet.</p>
          )}
          {revenueByEvent.map((row) => (
            <div key={row.title} className="flex items-center justify-between gap-4 p-3">
              <span className="font-medium">{row.title}</span>
              <span className="text-muted-foreground">
                {formatBdt(row.revenueBdt)} · {row.count} payment{row.count === 1 ? "" : "s"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Payment Success / Failure</h2>
        <p className="text-sm text-muted-foreground">
          {paymentRates.paid} paid · {paymentRates.failed} failed · {paymentRates.pending} pending
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Discount Usage</h2>
        <div className="divide-y rounded-lg border text-sm">
          {discountUsage.length === 0 && (
            <p className="p-4 text-muted-foreground">No coupons created yet.</p>
          )}
          {discountUsage.map((row) => (
            <div key={row.code} className="flex items-center justify-between gap-4 p-3">
              <span className="font-medium">{row.code}</span>
              <span className="text-muted-foreground">
                {row.redemptions} used · {formatBdt(row.totalDiscountBdt)} given
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Attendance and Completion</h2>
        <div className="divide-y rounded-lg border text-sm">
          {attendanceCompletion.length === 0 && (
            <p className="p-4 text-muted-foreground">No completed Events yet.</p>
          )}
          {attendanceCompletion.map((row) => (
            <div key={row.title} className="flex items-center justify-between gap-4 p-3">
              <span className="font-medium">{row.title}</span>
              <span className="text-muted-foreground">
                {row.completionRatePct}% completed · {row.attendanceRatePct}% attended
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Certificate Issuance</h2>
        <p className="text-sm text-muted-foreground">
          {certificates.issued} issued · {certificates.revoked} revoked
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Instructor Performance</h2>
        <div className="divide-y rounded-lg border text-sm">
          {instructorPerformance.length === 0 && (
            <p className="p-4 text-muted-foreground">No instructors yet.</p>
          )}
          {instructorPerformance.map((row) => (
            <div key={row.name} className="flex items-center justify-between gap-4 p-3">
              <span className="font-medium">{row.name}</span>
              <span className="text-muted-foreground">
                {row.eventCount} Event{row.eventCount === 1 ? "" : "s"} ·{" "}
                {row.registrationCount} registrations
                {row.avgRating !== null && ` · ${row.avgRating}/5 avg rating`}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
