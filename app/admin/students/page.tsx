import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { prisma } from "@/lib/db/client";
import { formatBdt } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ACTIVE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  SUSPENDED: "bg-red-500/15 text-red-400 border-red-500/30",
  DEACTIVATED: "bg-slate-500/15 text-slate-600 border-slate-500/30",
};

export default async function AdminStudentsPage(props: PageProps<"/admin/students">) {
  const searchParams = await props.searchParams;
  const query = typeof searchParams.q === "string" ? searchParams.q : "";

  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      ...(query
        ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }] }
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

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Students" description="Everyone registered as a student on Ariba IT." />

      <form className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search by name or email…"
          className="min-w-48 flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-gradient-to-r from-blue-500 to-green-600 px-4 py-2 text-sm font-semibold text-slate-900 hover:from-blue-400 hover:to-green-500"
        >
          Search
        </button>
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
            render: (s) => <StatusBadge status={s.status} map={STATUS_COLORS} />,
          },
          {
            key: "joined",
            label: "Joined",
            render: (s) => s.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
          },
        ]}
      />
    </div>
  );
}
