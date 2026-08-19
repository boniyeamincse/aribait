import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { getStudentRegistrations } from "@/lib/admin/student-detail";
import { formatBdt } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  CONFIRMED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  WAITLISTED: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  CANCELLED: "bg-red-500/15 text-red-400 border-red-500/30",
  EXPIRED: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  REFUNDED: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  COMPLETED: "bg-violet-500/15 text-violet-400 border-violet-500/30",
};

export async function RegistrationsTab({ userId }: { userId: string }) {
  const registrations = await getStudentRegistrations(userId);

  return (
    <AdminTable
      rowKey={(r) => r.id}
      rows={registrations}
      emptyMessage="No registrations yet."
      columns={[
        { key: "event", label: "Event", render: (r) => r.event.title },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} map={STATUS_COLORS} /> },
        { key: "price", label: "Price", render: (r) => formatBdt(r.priceSnapshotBdt) },
        { key: "payment", label: "Payment", render: (r) => r.payment?.status ?? "—" },
        {
          key: "registered",
          label: "Registered",
          render: (r) => r.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        },
      ]}
    />
  );
}
