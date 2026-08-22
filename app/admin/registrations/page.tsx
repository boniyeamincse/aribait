import Link from "next/link";
import { Users, CheckCircle, Clock, CreditCard, XCircle, Search } from "lucide-react";

import { prisma } from "@/lib/db/client";
import { formatBdt } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";

const REGISTRATION_STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-700 border-amber-200",
  CONFIRMED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
};

export default async function AdminRegistrationsPage(props: PageProps<"/admin/registrations">) {
  const searchParams = await props.searchParams;
  const query = typeof searchParams.q === "string" ? searchParams.q : "";
  const statusFilter = typeof searchParams.status === "string" ? searchParams.status : "";

  // Base where clause for filtering
  const whereClause = {
    ...(query
      ? {
          OR: [
            { user: { name: { contains: query, mode: "insensitive" as const } } },
            { user: { email: { contains: query, mode: "insensitive" as const } } },
            { event: { title: { contains: query, mode: "insensitive" as const } } },
          ],
        }
      : {}),
    ...(statusFilter ? { status: statusFilter as any } : {}),
  };

  const [registrations, stats] = await Promise.all([
    prisma.registration.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: true, event: true },
    }),
    // Get quick stats
    prisma.registration.groupBy({
      by: ["status"],
      _count: { id: true },
      _sum: { priceSnapshotBdt: true },
    })
  ]);

  const totalConfirmed = stats.find(s => s.status === "CONFIRMED")?._count.id || 0;
  const totalPending = stats.find(s => s.status === "PENDING_PAYMENT")?._count.id || 0;
  const revenue = stats.find(s => s.status === "CONFIRMED")?._sum.priceSnapshotBdt || 0;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <AdminPageHeader
        title="Registration Management"
        description="Track student enrollments, manage payment statuses, and monitor event capacity."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-1.5 bg-emerald-500 opacity-90" />
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Confirmed Enrollments</p>
            <p className="text-2xl font-black text-slate-900">{totalConfirmed}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-1.5 bg-amber-500 opacity-90" />
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-100">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Pending Payments</p>
            <p className="text-2xl font-black text-slate-900">{totalPending}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-1.5 bg-indigo-500 opacity-90" />
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Confirmed Revenue</p>
            <p className="text-2xl font-black text-slate-900">{formatBdt(revenue)}</p>
          </div>
        </div>
      </div>

      {/* Modern Filter Section */}
      <form className="flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative w-full sm:max-w-md shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by student name, email, or event title..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>
        <select
          name="status"
          defaultValue={statusFilter}
          className="w-full sm:w-auto rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
        >
          <option value="">All Statuses</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PENDING_PAYMENT">Pending Payment</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button
          type="submit"
          className="w-full sm:w-auto rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
        >
          Filter Results
        </button>
      </form>

      {/* Registrations Table */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-slate-900 px-1">Recent Activity</h2>
        
        <AdminTable
          rowKey={(r) => r.id}
          rows={registrations}
          emptyMessage="No registrations found."
          columns={[
            {
              key: "student",
              label: "Student",
              render: (r) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 border border-slate-200">
                    {r.user.name?.charAt(0) || "U"}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900">{r.user.name}</span>
                    <span className="text-xs text-slate-500">{r.user.email}</span>
                  </div>
                </div>
              ),
            },
            {
              key: "event",
              label: "Event",
              render: (r) => (
                <Link href={`/admin/events/${r.eventId}`} className="group flex flex-col">
                  <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{r.event.title}</span>
                  <span className="text-xs text-slate-500">
                    {r.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </Link>
              ),
            },
            {
              key: "amount",
              label: "Amount",
              render: (r) => (
                <span className="font-bold text-slate-700">{formatBdt(r.priceSnapshotBdt)}</span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (r) => (
                <StatusBadge 
                  status={r.status} 
                  map={REGISTRATION_STATUS_COLORS} 
                />
              ),
            }
          ]}
        />
      </div>
    </div>
  );
}
