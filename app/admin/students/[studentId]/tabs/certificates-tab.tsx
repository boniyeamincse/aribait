import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { getStudentCertificates } from "@/lib/admin/student-detail";

const STATUS_COLORS: Record<string, string> = {
  ISSUED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  REVOKED: "bg-red-500/15 text-red-400 border-red-500/30",
};

export async function CertificatesTab({ userId }: { userId: string }) {
  const certificates = await getStudentCertificates(userId);

  return (
    <AdminTable
      rowKey={(c) => c.id}
      rows={certificates}
      emptyMessage="No certificates issued yet."
      columns={[
        { key: "event", label: "Event", render: (c) => c.registration.event.title },
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
