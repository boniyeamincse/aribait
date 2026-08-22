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
  rows: { key: string; label: string; value: React.ReactNode }[];
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
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      <AdminPageHeader
        title="Reports & Analytics"
        description="Operational, financial, and student reporting across the platform."
        actions={
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm gap-2 px-4"
            render={<a href="/api/admin/reports/registrations-csv"><Download size={16} /> Export CSV Report</a>}
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
                value: (
                  <div className="flex gap-2">
                    <span className="text-emerald-600 font-semibold">{row.confirmed} confirmed</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-indigo-600 font-semibold">{row.completed} completed</span>
                  </div>
                ),
              }))}
            />
          </ReportCard>

          <ReportCard title="Attendance and Completion" icon={TrendingUp}>
            <ReportList
              emptyMessage="No completed Events yet."
              rows={attendanceCompletion.map((row) => ({
                key: row.title,
                label: row.title,
                value: (
                  <div className="flex gap-2">
                    <span className="text-indigo-600 font-semibold">{row.completionRatePct}% completed</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-emerald-600 font-semibold">{row.attendanceRatePct}% attended</span>
                  </div>
                ),
              }))}
            />
          </ReportCard>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <PieChart className="h-5 w-5 text-emerald-500" />
          <h2 className="text-base font-semibold uppercase tracking-widest text-slate-900">Financial Performance</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <ReportCard title="Revenue by Event" icon={TrendingUp}>
              <ReportList
                emptyMessage="No paid payments yet."
                rows={revenueByEvent.map((row) => ({
                  key: row.title,
                  label: row.title,
                  value: (
                    <div className="flex gap-3 items-center">
                      <span className="font-bold text-slate-900 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-md">{formatBdt(row.revenueBdt)}</span>
                      <span className="text-xs text-slate-500">{row.count} payment{row.count === 1 ? "" : "s"}</span>
                    </div>
                  ),
                }))}
              />
            </ReportCard>
          </div>

          <div className="flex flex-col gap-6">
            <ReportCard title="Enrollment Split" icon={PieChart}>
              <div className="flex flex-col gap-3 p-5 bg-slate-50/50 rounded-xl border border-slate-100">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 font-medium">Free</span>
                    <span className="font-bold text-slate-900">{pricingSplit.free}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full transition-all" style={{ width: pricingSplit.free + pricingSplit.paid > 0 ? `${(pricingSplit.free / (pricingSplit.free + pricingSplit.paid)) * 100}%` : '0%' }}></div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1 mt-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 font-medium">Paid</span>
                    <span className="font-bold text-slate-900">{pricingSplit.paid}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: pricingSplit.free + pricingSplit.paid > 0 ? `${(pricingSplit.paid / (pricingSplit.free + pricingSplit.paid)) * 100}%` : '0%' }}></div>
                  </div>
                </div>
              </div>
            </ReportCard>

            <ReportCard title="Payment Success" icon={PieChart}>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center justify-center p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-xl font-bold text-emerald-700">{paymentRates.paid}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mt-1">Paid</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <span className="text-xl font-bold text-amber-700">{paymentRates.pending}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mt-1">Pending</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-rose-50 rounded-xl border border-rose-100">
                  <span className="text-xl font-bold text-rose-700">{paymentRates.failed}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 mt-1">Failed</span>
                </div>
              </div>
            </ReportCard>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <Users className="h-5 w-5 text-indigo-500" />
          <h2 className="text-base font-semibold uppercase tracking-widest text-slate-900">Instructors & Certificates</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ReportCard title="Instructor Performance" icon={Users}>
            <ReportList
              emptyMessage="No instructors yet."
              rows={instructorPerformance.map((row) => ({
                key: row.name,
                label: row.name,
                value: (
                  <div className="flex gap-2 text-xs">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">{row.eventCount} Events</span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">{row.registrationCount} Students</span>
                  </div>
                ),
              }))}
            />
          </ReportCard>

          <ReportCard title="Certificate Analytics" icon={Award}>
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="flex flex-col items-center justify-center p-6 bg-slate-50/80 rounded-2xl border border-slate-100">
                <p className="text-4xl font-extrabold text-indigo-600">{certificates.issued}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-2">Total Issued</p>
              </div>
              <div className="flex flex-col items-center justify-center p-6 bg-rose-50/50 rounded-2xl border border-rose-100">
                <p className="text-4xl font-extrabold text-rose-600">{certificates.revoked}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-rose-500 mt-2">Revoked</p>
              </div>
            </div>
          </ReportCard>
        </div>
      </div>
    </div>
  );
}
