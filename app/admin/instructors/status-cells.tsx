import { setInstructorVerification, setInstructorAccountStatus } from "@/lib/instructors/actions";
import type { InstructorVerificationStatus, UserStatus } from "@/lib/generated/prisma/client";

const VERIFICATION_COLORS: Record<string, string> = {
  UNVERIFIED: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  VERIFIED: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  REJECTED: "bg-red-500/15 text-red-600 border-red-500/30",
};

const ACCOUNT_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  ACTIVE: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  SUSPENDED: "bg-red-500/15 text-red-600 border-red-500/30",
  DEACTIVATED: "bg-slate-500/15 text-slate-600 border-slate-500/30",
};

// Which account-status actions are offered from the current status
const ACCOUNT_STATUS_ACTIONS: Record<
  string,
  { label: string; newStatus: "ACTIVE" | "SUSPENDED" | "DEACTIVATED"; className: string }[]
> = {
  PENDING: [
    { label: "Activate", newStatus: "ACTIVE", className: "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
    { label: "Deactivate", newStatus: "DEACTIVATED", className: "border-slate-300 bg-white text-slate-500 hover:bg-slate-100" },
  ],
  ACTIVE: [
    { label: "Suspend", newStatus: "SUSPENDED", className: "border-red-300 bg-red-50 text-red-700 hover:bg-red-100" },
    { label: "Deactivate", newStatus: "DEACTIVATED", className: "border-slate-300 bg-white text-slate-500 hover:bg-slate-100" },
  ],
  SUSPENDED: [
    { label: "Reactivate", newStatus: "ACTIVE", className: "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
    { label: "Deactivate", newStatus: "DEACTIVATED", className: "border-slate-300 bg-white text-slate-500 hover:bg-slate-100" },
  ],
  DEACTIVATED: [
    { label: "Reactivate", newStatus: "ACTIVE", className: "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
  ],
};

export function VerificationCell({
  instructorId,
  verificationStatus,
  hasLogin,
}: {
  instructorId: string;
  verificationStatus: InstructorVerificationStatus;
  hasLogin: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span
        className={`w-fit rounded-full border px-2.5 py-0.5 text-xs font-semibold ${VERIFICATION_COLORS[verificationStatus]}`}
      >
        {verificationStatus}
      </span>
      {hasLogin && verificationStatus !== "VERIFIED" && (
        <form action={setInstructorVerification.bind(null, instructorId, "VERIFIED")}>
          <button
            type="submit"
            className="rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition-all hover:bg-emerald-100 active:scale-95"
          >
            ✓ Verify
          </button>
        </form>
      )}
      {hasLogin && verificationStatus === "VERIFIED" && (
        <form action={setInstructorVerification.bind(null, instructorId, "UNVERIFIED")}>
          <button
            type="submit"
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 transition-all hover:bg-red-50 hover:border-red-300 hover:text-red-600 active:scale-95"
          >
            Revoke
          </button>
        </form>
      )}
      {!hasLogin && <span className="text-xs text-slate-400 italic">No login account</span>}
    </div>
  );
}

export function AccountStatusCell({ userId, status }: { userId: string | null; status: UserStatus | null }) {
  if (!userId || !status) {
    return <span className="text-xs text-slate-500">No login</span>;
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className={`w-fit rounded-full border px-2.5 py-0.5 text-xs font-semibold ${ACCOUNT_STATUS_COLORS[status]}`}>
        {status}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {(ACCOUNT_STATUS_ACTIONS[status] ?? []).map((a) => (
          <form key={a.newStatus} action={setInstructorAccountStatus.bind(null, userId, a.newStatus)}>
            <button
              type="submit"
              className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition-all active:scale-95 ${a.className}`}
            >
              {a.label}
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
