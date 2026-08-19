import Link from "next/link";
import Image from "next/image";

import { requireAdmin } from "@/lib/permissions";
import { logout } from "@/lib/auth/logout-action";
import { Button } from "@/components/ui/button";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  const initials = (user.name ?? user.email ?? "A")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <AdminMobileNav />
          <Link href="/" className="flex shrink-0">
            <Image
              src="/logo.png"
              alt="Ariba IT"
              width={110}
              height={34}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
          {/* Admin badge */}
          <span className="hidden rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-violet-400 sm:block">
            Admin
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Greeting + time */}
          <div className="hidden flex-col items-end sm:flex">
            <span className="text-xs font-medium text-white">{user.name ?? "Admin"}</span>
            <span className="text-xs text-slate-500">{user.email}</span>
          </div>
          {/* Avatar */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-600 text-xs font-bold text-white shadow-md">
            {initials}
          </div>
          <form action={logout}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white text-xs"
            >
              Log out
            </Button>
          </form>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — desktop only */}
        <aside className="hidden md:flex md:w-64 md:shrink-0 md:flex-col">
          <AdminNav />
        </aside>
        {/* Main */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 text-white">
          {children}
        </main>
      </div>
    </div>
  );
}
