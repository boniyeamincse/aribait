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
import { Download, BarChart2, PieChart, Users, TrendingUp, Award } from "lucide-react";

function ReportCard({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon?: React.ElementType }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-indigo-100 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="mb-4 flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 text-indigo-500/70" />}
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700">{title}</h3>
      </div>
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
    return <p className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-lg text-center">{emptyMessage}</p>;
  }
  return (
    <div className="divide-y divide-slate-100 text-sm">
      {rows.map((row) => (
        <div key={row.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3">
          <span className="font-semibold text-slate-900">{row.label}</span>
          <span className="text-slate-500 font-medium text-right bg-slate-50 px-2 py-1 rounded-md">{row.value}</span>
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
        title="Reports & Analytics"
        description="Operational, financial, and student reporting across the platform."
        actions={
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm gap-2"
            render={<a href="/api/admin/reports/registrations-csv"><Download size={16} /> Export CSV</a>}
            nativeButton={false}
          />
        }
      />

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <BarChart2 className="h-5 w-5 text-indigo-500" />
          <h2 className="text-base font-semibold uppercase tracking-widest text-slate-900">Operational Metrics</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ReportCard title="Registrations by Event" icon={Users}>
            <ReportList
              emptyMessage="No Events yet."
              rows={registrationsByEvent.map((row) => ({
                key: row.eventId,
                label: row.title,
                value: `${row.confirmed} confirmed · ${row.waitlisted} waitlisted · ${row.completed} completed · ${row.cancelled} cancelled`,
              }))}
            />
          </ReportCard>

          <ReportCard title="Attendance and Completion" icon={TrendingUp}>
            <ReportList
              emptyMessage="No completed Events yet."
              rows={attendanceCompletion.map((row) => ({
                key: row.title,
                label: row.title,
                value: `${row.completionRatePct}% completed · ${row.attendanceRatePct}% attended`,
              }))}
            />
          </ReportCard>

          <ReportCard title="Certificate Issuance" icon={Award}>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="text-3xl font-extrabold text-slate-900">
                  {certificates.issued}
                </p>
                <p className="text-sm font-medium text-slate-500 mt-1">Issued Certificates</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-rose-600">
                  {certificates.revoked}
                </p>
                <p className="text-sm font-medium text-slate-500 mt-1">Revoked</p>
              </div>
            </div>
          </ReportCard>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <PieChart className="h-5 w-5 text-emerald-500" />
          <h2 className="text-base font-semibold uppercase tracking-widest text-slate-900">Financial Performance</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ReportCard title="Revenue by Event" icon={TrendingUp}>
            <ReportList
              emptyMessage="No paid payments yet."
              rows={revenueByEvent.map((row) => ({
                key: row.title,
                label: row.title,
                value: `${formatBdt(row.revenueBdt)} · ${row.count} payment${row.count === 1 ? "" : "s"}`,
              }))}
            />
          </ReportCard>

          <ReportCard title="Discount Usage" icon={TrendingUp}>
            <ReportList
              emptyMessage="No coupons created yet."
              rows={discountUsage.map((row) => ({
                key: row.code,
                label: row.code,
                value: `${row.redemptions} used · ${formatBdt(row.totalDiscountBdt)} given`,
              }))}
            />
          </ReportCard>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ReportCard title="Enrollment Split" icon={PieChart}>
              <div className="flex flex-col gap-2 p-4 bg-slate-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Free</span>
                  <span className="text-lg font-bold text-slate-900">{pricingSplit.free}</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full" style={{ width: pricingSplit.free + pricingSplit.paid > 0 ? `${(pricingSplit.free / (pricingSplit.free + pricingSplit.paid)) * 100}%` : '0%' }}></div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-slate-600 font-medium">Paid</span>
                  <span className="text-lg font-bold text-slate-900">{pricingSplit.paid}</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full" style={{ width: pricingSplit.free + pricingSplit.paid > 0 ? `${(pricingSplit.paid / (pricingSplit.free + pricingSplit.paid)) * 100}%` : '0%' }}></div>
                </div>
              </div>
            </ReportCard>

            <ReportCard title="Payment Success" icon={PieChart}>
              <div className="flex flex-col justify-center h-full gap-3 p-4 bg-slate-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-emerald-600">Paid</span>
                  <span className="font-bold text-emerald-700">{paymentRates.paid}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-rose-600">Failed</span>
                  <span className="font-bold text-rose-700">{paymentRates.failed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-amber-600">Pending</span>
                  <span className="font-bold text-amber-700">{paymentRates.pending}</span>
                </div>
              </div>
            </ReportCard>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <Users className="h-5 w-5 text-indigo-500" />
          <h2 className="text-base font-semibold uppercase tracking-widest text-slate-900">Instructors & Students</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ReportCard title="Instructor Performance" icon={Users}>
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
