import type { Metadata } from "next";
import { User, Shield, KeyRound, CalendarDays, Award, CreditCard, Info } from "lucide-react";

import { requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/db/client";
import { updateOwnPhoto } from "@/lib/dashboard/profile-actions";
import { AvatarUploadForm } from "@/components/shared/avatar-upload-form";
import { ChangePasswordForm } from "@/components/shared/change-password-form";

export const metadata: Metadata = {
  title: "My Profile — Ariba IT",
  description: "View and manage your Ariba IT account profile.",
};

export default async function ProfilePage() {
  // requireUser() already reads status/image fresh from the DB on every
  // request (see lib/permissions), not from the JWT.
  const user = await requireUser();

  const totalRegistrations = await prisma.registration.count({
    where: { userId: user.id },
  });

  const initials = (user.name ?? user.email ?? "?")
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const ROLE_LABELS: Record<string, string> = {
    ADMIN: "Administrator",
    INSTRUCTOR: "Instructor",
    STUDENT: "Student",
  };

  const STATUS_COLORS: Record<string, string> = {
    ACTIVE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    PENDING: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    SUSPENDED: "bg-red-500/15 text-red-400 border-red-500/30",
    DEACTIVATED: "bg-slate-500/15 text-slate-600 border-slate-500/30",
  };

  const statusColor =
    STATUS_COLORS[user.status as string] ??
    "bg-slate-500/15 text-slate-600 border-slate-500/30";

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          View and manage your account information.
        </p>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          {/* Avatar */}
          <AvatarUploadForm action={updateOwnPhoto} currentImage={user.image ?? null} fallbackText={initials} />

          {/* Info */}
          <div className="flex flex-1 flex-col gap-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h2 className="text-xl font-bold text-slate-900">
                {user.name ?? "—"}
              </h2>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColor}`}
              >
                {user.status}
              </span>
            </div>
            <p className="text-sm text-slate-600">{user.email}</p>
            <p className="mt-1 text-xs text-slate-600">
              Role:{" "}
              <span className="font-medium text-slate-600">
                {ROLE_LABELS[user.role] ?? user.role}
              </span>
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex gap-6 rounded-xl border border-slate-200 bg-slate-50 px-6 py-4">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-2xl font-bold text-slate-900">
                {totalRegistrations}
              </span>
              <span className="text-xs text-slate-500">Registrations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Account information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-indigo-600">
            <User size={16} /> Account Information
          </h3>
          <dl className="flex flex-col gap-4">
            {[
              { label: "Full Name", value: user.name ?? "Not set" },
              { label: "Email Address", value: user.email ?? "—" },
              { label: "Account Role", value: ROLE_LABELS[user.role] ?? user.role },
              { label: "Account Status", value: user.status },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <dt className="text-xs font-medium uppercase tracking-wider text-slate-600">
                  {label}
                </dt>
                <dd className="text-sm font-medium text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Security */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-emerald-600">
            <Shield size={16} /> Security
          </h3>
          <div className="flex flex-col gap-4">
            <ChangePasswordForm />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-600">
                Two-Factor Auth
              </span>
              <span className="text-sm text-slate-500">Not enabled</span>
            </div>
            <div className="mt-2 flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
              <Info size={14} className="mt-0.5 shrink-0 text-slate-400" />
              Contact support to update your name or email.
            </div>
          </div>
        </div>
      </div>

      {/* Platform info */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-indigo-600">
          <KeyRound size={16} /> Platform
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: CalendarDays,
              label: "Live Sessions",
              desc: "Join from your Sessions page",
              color: "text-emerald-500",
            },
            {
              icon: Award,
              label: "Certificates",
              desc: "Download after course completion",
              color: "text-amber-500",
            },
            {
              icon: CreditCard,
              label: "Payments",
              desc: "bKash & Nagad supported",
              color: "text-sky-500",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <item.icon size={22} className={`shrink-0 ${item.color}`} />
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
