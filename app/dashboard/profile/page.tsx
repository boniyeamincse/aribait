import type { Metadata } from "next";
import { User, Shield, KeyRound, CalendarDays, Award, CreditCard, Info, Sparkles, BookOpen } from "lucide-react";

import { requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/db/client";
import { updateOwnPhoto } from "@/lib/dashboard/profile-actions";
import { AvatarUploadForm } from "@/components/shared/avatar-upload-form";
import { ChangePasswordForm } from "@/components/shared/change-password-form";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "My Account — Ariba IT",
  description: "View and manage your Ariba IT account profile.",
};

export default async function ProfilePage() {
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
    ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    SUSPENDED: "bg-rose-100 text-rose-700 border-rose-200",
    DEACTIVATED: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const statusColor = STATUS_COLORS[user.status as string] ?? "bg-slate-100 text-slate-600 border-slate-200";
  const displayRole = ROLE_LABELS[user.role] ?? user.role;

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      {/* Premium Header Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <User className="text-indigo-600" /> My Account
          </h1>
          <p className="text-sm font-medium text-slate-500">
            View and manage your personal profile and security settings.
          </p>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-1 sm:p-2 shadow-sm">
        {/* Decorative Top Banner */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600" />
        
        <div className="relative z-10 mt-16 px-4 sm:px-8 pb-6 flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
          {/* Avatar Container with glowing effect */}
          <div className="rounded-full p-1.5 bg-white shadow-xl shadow-indigo-500/10 shrink-0">
            <AvatarUploadForm action={updateOwnPhoto} currentImage={user.image ?? null} fallbackText={initials} />
          </div>

          <div className="flex-1 flex flex-col gap-1 pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {user.name ?? "—"}
              </h2>
              <Badge className={`uppercase text-[10px] tracking-widest px-3 py-1 shadow-none rounded-full ${statusColor}`}>
                {user.status}
              </Badge>
            </div>
            <p className="text-sm font-medium text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 mt-1">
              {user.email}
              <span className="h-1 w-1 rounded-full bg-slate-300 mx-1 hidden sm:block" />
              <span className="uppercase tracking-widest text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                {displayRole}
              </span>
            </p>
          </div>

          {/* Quick Stats Block */}
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4 w-full sm:w-auto shadow-inner">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <BookOpen size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-slate-900 leading-none">{totalRegistrations}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">Enrollments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Account information */}
        <div className="group rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm transition-all hover:shadow-md hover:border-indigo-200">
          <h3 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-indigo-600">
            <User size={16} /> Personal Information
          </h3>
          <dl className="flex flex-col gap-5">
            {[
              { label: "Full Name", value: user.name ?? "Not set" },
              { label: "Email Address", value: user.email ?? "—" },
              { label: "Account Role", value: displayRole },
              { label: "Account Status", value: user.status },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-1 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  {label}
                </dt>
                <dd className="text-sm font-semibold text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Security */}
        <div className="group rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm transition-all hover:shadow-md hover:border-emerald-200">
          <h3 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-emerald-600">
            <Shield size={16} /> Security & Access
          </h3>
          <div className="flex flex-col gap-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <ChangePasswordForm />
            </div>
            
            <div className="flex flex-col gap-1 border-b border-slate-100 pb-4">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Two-Factor Auth
              </span>
              <span className="text-sm font-medium text-slate-500">Not enabled for this account</span>
            </div>
            
            <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-xs font-medium text-blue-800">
              <Info size={16} className="mt-0.5 shrink-0 text-blue-500" />
              <p>Need to update your verified name or primary email? Please contact platform support for identity verification.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Platform features */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <h3 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-indigo-600">
          <Sparkles size={16} /> Platform Guide
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: CalendarDays,
              label: "Live Sessions",
              desc: "Join scheduled classes directly from your Dashboard",
              color: "text-emerald-500",
              bg: "bg-emerald-50"
            },
            {
              icon: Award,
              label: "Certificates",
              desc: "Download verified credentials upon completion",
              color: "text-amber-500",
              bg: "bg-amber-50"
            },
            {
              icon: CreditCard,
              label: "Payments",
              desc: "Seamless local transactions via bKash & Nagad",
              color: "text-sky-500",
              bg: "bg-sky-50"
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-100 group"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                <item.icon size={20} />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold text-slate-900">{item.label}</p>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
