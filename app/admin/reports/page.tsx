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
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { formatBdt } from "@/lib/utils";

function ReportCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h3 className="mb-3 text-sm font-semibold text-slate-300">{title}</h3>
      {children}
    </section>
  );
}

function ReportList({
  rows,
  emptyMessage,
}: {
  rows: { key: string; label: string; value: string }[];
  emptyMessage: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-slate-600">{emptyMessage}</p>;
  }
  return (
    <div className="divide-y divide-slate-800/50 text-sm">
      {rows.map((row) => (
        <div key={row.key} className="flex items-center justify-between gap-4 py-2">
          <span className="font-medium text-white">{row.label}</span>
          <span className="text-slate-400">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

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
      <AdminPageHeader
        title="Reports"
        description="Operational, financial and student reporting across the platform."
        actions={
          <Button
            size="sm"
            variant="outline"
            render={<a href="/api/admin/reports/registrations-csv">Export registrations CSV</a>}
            nativeButton={false}
          />
        }
      />

      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Operational</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ReportCard title="Registrations by Event">
            <ReportList
              emptyMessage="No Events yet."
              rows={registrationsByEvent.map((row) => ({
                key: row.eventId,
                label: row.title,
                value: `${row.confirmed} confirmed · ${row.waitlisted} waitlisted · ${row.completed} completed · ${row.cancelled} cancelled`,
              }))}
            />
          </ReportCard>

          <ReportCard title="Attendance and Completion">
            <ReportList
              emptyMessage="No completed Events yet."
              rows={attendanceCompletion.map((row) => ({
                key: row.title,
                label: row.title,
                value: `${row.completionRatePct}% completed · ${row.attendanceRatePct}% attended`,
              }))}
            />
          </ReportCard>

          <ReportCard title="Certificate Issuance">
            <p className="text-2xl font-bold text-white">
              {certificates.issued} <span className="text-sm font-normal text-slate-500">issued</span>
            </p>
            <p className="text-sm text-slate-500">{certificates.revoked} revoked</p>
          </ReportCard>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Financial</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ReportCard title="Revenue by Event">
            <ReportList
              emptyMessage="No paid payments yet."
              rows={revenueByEvent.map((row) => ({
                key: row.title,
                label: row.title,
                value: `${formatBdt(row.revenueBdt)} · ${row.count} payment${row.count === 1 ? "" : "s"}`,
              }))}
            />
          </ReportCard>

          <ReportCard title="Free vs Paid Enrollment">
            <p className="text-2xl font-bold text-white">
              {pricingSplit.free} <span className="text-sm font-normal text-slate-500">free</span>
            </p>
            <p className="text-sm text-slate-500">{pricingSplit.paid} paid confirmed registrations</p>
          </ReportCard>

          <ReportCard title="Payment Success / Failure">
            <p className="text-sm text-slate-300">
              {paymentRates.paid} paid · {paymentRates.failed} failed · {paymentRates.pending} pending
            </p>
          </ReportCard>

          <ReportCard title="Discount Usage">
            <ReportList
              emptyMessage="No coupons created yet."
              rows={discountUsage.map((row) => ({
                key: row.code,
                label: row.code,
                value: `${row.redemptions} used · ${formatBdt(row.totalDiscountBdt)} given`,
              }))}
            />
          </ReportCard>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Students</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ReportCard title="Instructor Performance">
            <ReportList
              emptyMessage="No instructors yet."
              rows={instructorPerformance.map((row) => ({
                key: row.name,
                label: row.name,
                value: `${row.eventCount} Event${row.eventCount === 1 ? "" : "s"} · ${row.registrationCount} registrations${row.avgRating !== null ? ` · ${row.avgRating}/5 avg rating` : ""}`,
              }))}
            />
          </ReportCard>
        </div>
      </div>
    </div>
  );
}
