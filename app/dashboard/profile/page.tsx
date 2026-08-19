import type { Metadata } from "next";
import { requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/db/client";

export const metadata: Metadata = {
  title: "My Profile — Ariba IT",
  description: "View and manage your Ariba IT account profile.",
};

export default async function ProfilePage() {
  const user = await requireUser();

  // Fetch registration count for summary
  const totalRegistrations = await prisma.registration.count({
    where: { userId: user.id },
  });

  const initials = (user.name ?? user.email ?? "?")
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const STATUS_COLORS: Record<string, string> = {
    ACTIVE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    PENDING: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    SUSPENDED: "bg-red-500/15 text-red-400 border-red-500/30",
    DEACTIVATED: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  };

  const statusColor =
    STATUS_COLORS[user.status as string] ??
    "bg-slate-500/15 text-slate-400 border-slate-500/30";

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          View and manage your account information.
        </p>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 text-2xl font-bold text-white shadow-lg shadow-cyan-500/20">
            {initials}
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col gap-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h2 className="text-xl font-bold text-white">
                {user.name ?? "—"}
              </h2>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColor}`}
              >
                {user.status}
              </span>
            </div>
            <p className="text-sm text-slate-400">{user.email}</p>
            <p className="mt-1 text-xs text-slate-600">
              Role:{" "}
              <span className="font-medium text-slate-400">
                {user.role === "ADMIN" ? "Administrator" : "Student"}
              </span>
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex gap-6 rounded-xl border border-slate-800 bg-slate-950 px-6 py-4">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-2xl font-bold text-white">
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
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-cyan-400">
            <span>👤</span> Account Information
          </h3>
          <dl className="flex flex-col gap-4">
            {[
              { label: "Full Name", value: user.name ?? "Not set" },
              { label: "Email Address", value: user.email ?? "—" },
              { label: "Account Role", value: user.role === "ADMIN" ? "Administrator" : "Student" },
              { label: "Account Status", value: user.status },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <dt className="text-xs font-medium uppercase tracking-wider text-slate-600">
                  {label}
                </dt>
                <dd className="text-sm font-medium text-slate-200">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Security */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-violet-400">
            <span>🔐</span> Security
          </h3>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-600">
                Password
              </span>
              <span className="text-sm text-slate-400">
                ••••••••••••
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-600">
                Two-Factor Auth
              </span>
              <span className="text-sm text-slate-500">Not enabled</span>
            </div>
            <div className="mt-2 rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-500">
              💡 Contact support to update your name, email, or password.
            </div>
          </div>
        </div>
      </div>

      {/* Platform info */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-emerald-400">
          <span>📋</span> Platform
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: "📅",
              label: "Live Sessions",
              desc: "Join from your Sessions page",
            },
            {
              icon: "🏆",
              label: "Certificates",
              desc: "Download after course completion",
            },
            {
              icon: "💳",
              label: "Payments",
              desc: "bKash & Nagad supported",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4"
            >
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
