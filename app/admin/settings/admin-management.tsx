"use client";

import { useTransition, useRef } from "react";
import { User, Shield, ShieldAlert, Trash2, Mail } from "lucide-react";
import { promoteToAdmin, revokeAdmin } from "@/lib/settings/actions";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export function AdminManagement({
  admins,
  currentAdminId,
}: {
  admins: AdminUser[];
  currentAdminId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handlePromote = (formData: FormData) => {
    startTransition(async () => {
      const res = await promoteToAdmin(formData);
      if (res.ok) {
        toast.success("User promoted to Admin.");
        formRef.current?.reset();
      } else {
        toast.error(res.error);
      }
    });
  };

  const handleRevoke = (userId: string) => {
    if (userId === currentAdminId) {
      toast.error("You cannot revoke your own access.");
      return;
    }
    
    if (!confirm("Are you sure you want to revoke admin access for this user?")) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("userId", userId);
      const res = await revokeAdmin(formData);
      if (res.ok) {
        toast.success("Admin access revoked.");
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Add Admin Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-1">
          Promote to Admin
        </h3>
        <p className="text-sm text-slate-500 mb-5">
          Enter the email address of an existing student to grant them full admin privileges.
        </p>
        <form ref={formRef} action={handlePromote} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              name="email"
              required
              placeholder="user@example.com"
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 disabled:opacity-50"
          >
            {isPending ? "Adding..." : "Add Admin"}
          </button>
        </form>
      </div>

      {/* Admin List */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-4">
          Active Admins ({admins.length})
        </h3>
        <div className="flex flex-col gap-3">
          {admins.map((admin) => (
            <div key={admin.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-4">
                {admin.image ? (
                  <img src={admin.image} alt={admin.name || "User"} className="h-10 w-10 rounded-full bg-slate-100 object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold">
                    {admin.name?.charAt(0).toUpperCase() || admin.email.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-slate-900 flex items-center gap-2">
                    {admin.name || "Unknown"}
                    {admin.id === currentAdminId && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        YOU
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-slate-500">{admin.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                  <Shield size={14} />
                  Super Admin
                </div>
                {admin.id !== currentAdminId && (
                  <button
                    onClick={() => handleRevoke(admin.id)}
                    disabled={isPending}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Revoke Access"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
