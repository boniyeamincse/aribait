import { StatusBadge } from "@/components/admin/status-badge";
import type { User } from "@/lib/generated/prisma/client";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ACTIVE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  SUSPENDED: "bg-red-500/15 text-red-400 border-red-500/30",
  DEACTIVATED: "bg-slate-500/15 text-slate-600 border-slate-500/30",
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 text-sm text-slate-900">{value}</p>
    </div>
  );
}

export function ProfileTab({ student }: { student: User }) {
  return (
    <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-6">
      <div className="grid grid-cols-2 gap-6">
        <Field label="Name" value={student.name ?? "—"} />
        <Field label="Email" value={student.email} />
        <Field
          label="Email verified"
          value={student.emailVerified ? student.emailVerified.toLocaleDateString("en-GB") : "Not verified"}
        />
        <Field label="Account status" value={<StatusBadge status={student.status} map={STATUS_COLORS} />} />
        <Field
          label="Joined"
          value={student.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        />
        <Field
          label="Last updated"
          value={student.updatedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        />
      </div>
    </div>
  );
}
