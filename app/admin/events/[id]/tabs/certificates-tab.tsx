import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { getEventCertificates } from "@/lib/admin/event-detail";

const STATUS_COLORS: Record<string, string> = {
  ISSUED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  REVOKED: "bg-red-500/15 text-red-400 border-red-500/30",
};

export async function CertificatesTab({ eventId }: { eventId: string }) {
  const certificates = await getEventCertificates(eventId);

  return (
    <AdminTable
      rowKey={(c) => c.id}
      rows={certificates}
      emptyMessage="No certificates issued for this Event yet. Issue certificates from the Certificates page once a registration is completed."
      columns={[
        {
          key: "student",
          label: "Student",
          render: (c) => c.registration.user.name ?? c.registration.user.email,
        },
        { key: "number", label: "Certificate #", render: (c) => c.certificateNumber },
        { key: "status", label: "Status", render: (c) => <StatusBadge status={c.status} map={STATUS_COLORS} /> },
        {
          key: "issued",
          label: "Issued",
          render: (c) => c.issuedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        },
      ]}
    />
  );
}
