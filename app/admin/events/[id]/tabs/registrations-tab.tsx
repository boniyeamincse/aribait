import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { getEventRegistrations } from "@/lib/admin/event-detail";
import { formatBdt } from "@/lib/utils";

const REGISTRATION_STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  CONFIRMED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  WAITLISTED: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  CANCELLED: "bg-red-500/15 text-red-400 border-red-500/30",
  EXPIRED: "bg-slate-500/15 text-slate-600 border-slate-500/30",
  REFUNDED: "bg-slate-500/15 text-slate-600 border-slate-500/30",
  COMPLETED: "bg-green-500/15 text-green-400 border-green-500/30",
};

export async function RegistrationsTab({ eventId }: { eventId: string }) {
  const registrations = await getEventRegistrations(eventId);

  return (
    <AdminTable
      rowKey={(r) => r.id}
      rows={registrations}
      emptyMessage="No registrations for this Event yet."
      columns={[
        {
          key: "student",
          label: "Student",
          render: (r) => (
            <div>
              <p className="font-medium text-slate-900">{r.user.name ?? r.user.email}</p>
              <p className="text-xs text-slate-500">{r.user.email}</p>
            </div>
          ),
        },
        {
          key: "status",
          label: "Status",
          render: (r) => <StatusBadge status={r.status} map={REGISTRATION_STATUS_COLORS} />,
        },
        { key: "price", label: "Price", render: (r) => formatBdt(r.priceSnapshotBdt) },
        {
          key: "discount",
          label: "Discount",
          render: (r) => (r.discountAmountSnapshotBdt > 0 ? formatBdt(r.discountAmountSnapshotBdt) : "—"),
        },
        {
          key: "payment",
          label: "Payment",
          render: (r) => r.payment?.status ?? "—",
        },
        {
          key: "registered",
          label: "Registered",
          render: (r) => r.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        },
      ]}
    />
  );
}
