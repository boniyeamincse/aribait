"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/admin/status-badge";
import { changeStudentStatus } from "@/lib/admin/student-actions";
import type { User } from "@/lib/generated/prisma/client";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ACTIVE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  SUSPENDED: "bg-red-500/15 text-red-400 border-red-500/30",
  DEACTIVATED: "bg-slate-500/15 text-slate-600 border-slate-500/30",
};

// Actions available per current status
const STATUS_ACTIONS: Record<
  string,
  { label: string; newStatus: string; variant: "green" | "red" | "amber" | "slate" }[]
> = {
  PENDING: [
    { label: "✓ Activate", newStatus: "ACTIVE", variant: "green" },
    { label: "Suspend", newStatus: "SUSPENDED", variant: "red" },
    { label: "Deactivate", newStatus: "DEACTIVATED", variant: "slate" },
  ],
  ACTIVE: [
    { label: "Suspend", newStatus: "SUSPENDED", variant: "red" },
    { label: "Deactivate", newStatus: "DEACTIVATED", variant: "slate" },
  ],
  SUSPENDED: [
    { label: "✓ Reactivate", newStatus: "ACTIVE", variant: "green" },
    { label: "Deactivate", newStatus: "DEACTIVATED", variant: "slate" },
  ],
  DEACTIVATED: [{ label: "✓ Reactivate", newStatus: "ACTIVE", variant: "green" }],
};

const VARIANT_CLASSES: Record<string, string> = {
  green:
    "border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:scale-95",
  red: "border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 active:scale-95",
  amber:
    "border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 active:scale-95",
  slate:
    "border border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100 active:scale-95",
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
  const [isPending, startTransition] = useTransition();
  const actions = STATUS_ACTIONS[student.status] ?? [];

  function handleStatusChange(newStatus: string) {
    startTransition(async () => {
      const result = await changeStudentStatus(
        student.id,
        newStatus as User["status"],
      );
      if (result.ok) {
        toast.success(`Status updated to ${newStatus}.`);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-5 max-w-xl">
      {/* Profile fields */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="grid grid-cols-2 gap-6">
          <Field label="Name" value={student.name ?? "—"} />
          <Field label="Email" value={student.email} />
          <Field
            label="Email verified"
            value={
              student.emailVerified
                ? student.emailVerified.toLocaleDateString("en-GB")
                : "Not verified"
            }
          />
          <Field
            label="Account status"
            value={<StatusBadge status={student.status} map={STATUS_COLORS} />}
          />
          <Field
            label="Joined"
            value={student.createdAt.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          />
          <Field
            label="Last updated"
            value={student.updatedAt.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          />
        </div>
      </div>

      {/* Status management */}
      {actions.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Change account status
          </p>
          <div className="flex flex-wrap gap-2">
            {actions.map((a) => (
              <button
                key={a.newStatus}
                disabled={isPending}
                onClick={() => handleStatusChange(a.newStatus)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-150 disabled:opacity-50 ${VARIANT_CLASSES[a.variant]}`}
              >
                {isPending ? "Saving…" : a.label}
              </button>
            ))}
          </div>
          {student.status === "PENDING" && (
            <p className="mt-3 text-xs text-amber-600">
              ⚠ This student is pending activation — click &quot;Activate&quot; to grant full
              platform access.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
