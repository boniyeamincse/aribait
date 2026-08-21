import Link from "next/link";
import Image from "next/image";

import { requireAdmin } from "@/lib/permissions";
import { logout } from "@/lib/auth/logout-action";
import { prisma } from "@/lib/db/client";
import { Button } from "@/components/ui/button";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { GlobalSearch } from "@/components/admin/global-search";
import { QuickCreate } from "@/components/admin/quick-create";
import { TopBarClock } from "@/components/admin/top-bar-clock";
import { TopBarNotifications } from "@/components/admin/top-bar-notifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, readAt: null },
  });

  const initials = (user.name ?? user.email ?? "A")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 items-center gap-3 md:gap-6">
          {/* Mobile hamburger */}
          <AdminMobileNav />
          <Link href="/" className="hidden shrink-0 md:flex">
            <Image
              src="/logo.png"
              alt="Ariba IT"
              width={62}
              height={34}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
          <GlobalSearch />
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <QuickCreate />
          <TopBarClock />
          <TopBarNotifications unreadCount={unreadCount} />

          {/* Admin profile and logout */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-indigo-600 text-xs font-bold text-white shadow-sm ring-offset-2 transition-all hover:ring-2 hover:ring-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                  {initials}
                </button>
              }
            />
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="flex flex-col">
                  <span className="text-sm font-medium text-slate-900">{user.name ?? "Admin"}</span>
                  <span className="text-xs font-normal text-slate-500">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/dashboard/profile">Profile</Link>} />
                <DropdownMenuItem render={<Link href="/admin/settings">Settings</Link>} />
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={
                    <form action={logout} className="w-full">
                      <button type="submit" className="w-full text-left text-destructive">
                        Log out
                      </button>
                    </form>
                  }
                />
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — desktop only */}
        <aside className="hidden md:flex md:w-64 md:shrink-0 md:flex-col">
          <AdminNav />
        </aside>
        {/* Main */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 text-slate-900">
          {children}
        </main>
      </div>
    </div>
  );
}
