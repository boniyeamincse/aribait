import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { prisma } from "@/lib/db/client";
import { formatBdt } from "@/lib/utils";

import { QuickActivateButton } from "./quick-activate-button";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ACTIVE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  SUSPENDED: "bg-red-500/15 text-red-400 border-red-500/30",
  DEACTIVATED: "bg-slate-500/15 text-slate-600 border-slate-500/30",
};

export default async function AdminStudentsPage(props: PageProps<"/admin/students">) {
  const searchParams = await props.searchParams;
  const query = typeof searchParams.q === "string" ? searchParams.q : "";
  const statusFilter =
    typeof searchParams.status === "string" ? searchParams.status : "";

  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      ...(statusFilter ? { status: statusFilter as never } : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      registrations: {
        select: { status: true, payment: { select: { amountBdt: true, status: true } } },
      },
    },
  });

  const pendingCount = await prisma.user.count({
    where: { role: "STUDENT", status: "PENDING" },
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Students"
        description="Everyone registered as a student on Ariba IT."
      />

      {/* Pending alert banner */}
      {pendingCount > 0 && !statusFilter && (
        <div className="flex items-center justify-between rounded-2xl border border-amber-300 bg-amber-50 px-5 py-3">
          <p className="text-sm font-medium text-amber-800">
            ⚠ {pendingCount} student{pendingCount > 1 ? "s" : ""} pending activation
          </p>
          <Link
            href="/admin/students?status=PENDING"
            className="rounded-lg border border-amber-400 bg-white px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100"
          >
            View pending
          </Link>
        </div>
      )}

      {/* Filters */}
      <form className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search by name or email…"
          className="min-w-48 flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
        />
        <select
          name="status"
          defaultValue={statusFilter}
          className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="DEACTIVATED">Deactivated</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-gradient-to-r from-blue-500 to-green-600 px-4 py-2 text-sm font-semibold text-slate-900 hover:from-blue-400 hover:to-green-500"
        >
          Search
        </button>
        {(query || statusFilter) && (
          <Link
            href="/admin/students"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Clear
          </Link>
        )}
      </form>

      <AdminTable
        rowKey={(s) => s.id}
        rows={students}
        emptyMessage="No students match this search."
        columns={[
          {
            key: "name",
            label: "Name",
            render: (s) => (
              <Link href={`/admin/students/${s.id}`} className="font-medium text-slate-900 hover:underline">
                {s.name ?? "—"}
                <span className="block text-xs font-normal text-slate-500">{s.email}</span>
              </Link>
            ),
          },
          {
            key: "verified",
            label: "Verified",
            render: (s) =>
              s.emailVerified ? (
                <span className="text-emerald-400">Yes</span>
              ) : (
                <span className="text-slate-500">No</span>
              ),
          },
          {
            key: "events",
            label: "Events",
            render: (s) => s.registrations.length,
          },
          {
            key: "completed",
            label: "Completed",
            render: (s) => s.registrations.filter((r) => r.status === "COMPLETED").length,
          },
          {
            key: "paid",
            label: "Total Paid",
            render: (s) =>
              formatBdt(
                s.registrations.reduce(
                  (sum, r) => sum + (r.payment?.status === "PAID" ? r.payment.amountBdt : 0),
                  0,
                ),
              ),
          },
          {
            key: "status",
            label: "Status",
            render: (s) => (
              <div className="flex items-center gap-2">
                <StatusBadge status={s.status} map={STATUS_COLORS} />
                {s.status === "PENDING" && <QuickActivateButton userId={s.id} />}
              </div>
            ),
          },
          {
            key: "joined",
            label: "Joined",
            render: (s) =>
              s.createdAt.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
          },
        ]}
      />
    </div>
  );
}
