import type { Metadata } from "next";
import { User, Shield } from "lucide-react";

import { requireAdmin } from "@/lib/permissions";
import { updateOwnPhoto } from "@/lib/dashboard/profile-actions";
import { AvatarUploadForm } from "@/components/shared/avatar-upload-form";
import { ChangePasswordForm } from "@/components/shared/change-password-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export const metadata: Metadata = {
  title: "My Profile — Ariba IT Admin",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  PENDING: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  SUSPENDED: "bg-red-500/15 text-red-600 border-red-500/30",
  DEACTIVATED: "bg-slate-500/15 text-slate-600 border-slate-500/30",
};

export default async function AdminProfilePage() {
  // requireAdmin() -> requireUser() already reads status/image fresh from
  // the DB on every request (see lib/permissions), not from the JWT.
  const user = await requireAdmin();

  const initials = (user.name ?? user.email ?? "A")
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const statusColor = STATUS_COLORS[user.status] ?? "bg-slate-500/15 text-slate-600 border-slate-500/30";

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title="My Profile" description="View and manage your admin account." />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          <AvatarUploadForm action={updateOwnPhoto} currentImage={user.image ?? null} fallbackText={initials} />

          <div className="flex flex-1 flex-col gap-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h2 className="text-xl font-bold text-slate-900">{user.name ?? "—"}</h2>
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColor}`}>
                {user.status}
              </span>
            </div>
            <p className="text-sm text-slate-600">{user.email}</p>
            <p className="mt-1 text-xs text-slate-600">
              Role: <span className="font-medium text-slate-600">Administrator</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-indigo-600">
            <User size={16} /> Account Information
          </h3>
          <dl className="flex flex-col gap-4">
            {[
              { label: "Full Name", value: user.name ?? "Not set" },
              { label: "Email Address", value: user.email ?? "—" },
              { label: "Account Role", value: "Administrator" },
              { label: "Account Status", value: user.status },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <dt className="text-xs font-medium uppercase tracking-wider text-slate-600">{label}</dt>
                <dd className="text-sm font-medium text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-emerald-600">
            <Shield size={16} /> Security
          </h3>
          <div className="flex flex-col gap-4">
            <ChangePasswordForm />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-600">Two-Factor Auth</span>
              <span className="text-sm text-slate-500">Not enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
