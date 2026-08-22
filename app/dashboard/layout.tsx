import Link from "next/link";
import Image from "next/image";
import { Bell } from "lucide-react";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";

import { requireUser } from "@/lib/permissions";
import { logout } from "@/lib/auth/logout-action";
import { prisma } from "@/lib/db/client";
import { Button } from "@/components/ui/button";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { AvatarBadge } from "@/components/shared/avatar-badge";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  if (user.role === "ADMIN") {
    redirect("/admin");
  }
  if (user.role === "INSTRUCTOR") {
    redirect("/instructor");
  }

  // user.image is already fresh — requireUser() reads it from the DB on
  // every request, not from the JWT (see lib/permissions).
  const [settings, unreadCount] = await Promise.all([
    prisma.settings.findUnique({ where: { id: 1 }, select: { siteLogoUrl: true, siteName: true } }),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);

  const initials = (user.name ?? user.email ?? "?")
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <Toaster richColors position="top-right" />
      {/* Top header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-md sm:px-6 shadow-sm">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src={settings?.siteLogoUrl || "/logo.png"}
            alt={settings?.siteName || "Ariba IT"}
            width={62}
            height={34}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>

        <div className="flex items-center gap-3">
          {/* Notification bell */}
          <Link
            href="/dashboard/notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {/* User info */}
          <div className="flex items-center gap-2.5">
            <AvatarBadge
              image={user.image}
              initials={initials}
              className="h-8 w-8 text-xs bg-gradient-to-br from-indigo-500 to-purple-600"
            />
            <div className="hidden flex-col sm:flex">
              <span className="text-xs font-semibold text-slate-900 leading-tight">
                {user.name ?? "Student"}
              </span>
              <span className="text-[10px] text-slate-500 leading-tight">{user.email}</span>
            </div>
          </div>

          <form action={logout}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-xs rounded-full px-4"
            >
              Log out
            </Button>
          </form>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — hidden on mobile, shown on md+ */}
        <aside className="hidden md:flex md:w-56 md:shrink-0">
          <DashboardNav />
        </aside>

        <main className="flex-1 overflow-y-auto p-4 text-slate-900 sm:p-6 lg:p-8">
          {/* Mobile nav tabs — shown only on mobile */}
          <div className="mb-4 -mx-4 overflow-x-auto border-b border-slate-200 px-4 md:hidden">
            <DashboardNav mobile />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
