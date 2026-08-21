import Link from "next/link";
import Image from "next/image";

import { redirect } from "next/navigation";

import { requireUser } from "@/lib/permissions";
import { logout } from "@/lib/auth/logout-action";
import { Button } from "@/components/ui/button";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  if (user.role === "ADMIN" || user.role === "INSTRUCTOR") {
    redirect("/admin");
  }

  const initials = (user.name ?? user.email ?? "?")
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      {/* Top header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-4 py-3 backdrop-blur-md sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Ariba IT"
            width={62}
            height={34}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>

        <div className="flex items-center gap-3">
          {/* User badge */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-green-600 text-xs font-bold text-slate-900">
              {initials}
            </div>
            <div className="hidden flex-col sm:flex">
              <span className="text-xs font-medium text-slate-900 leading-tight">
                {user.name ?? "Student"}
              </span>
              <span className="text-xs text-slate-500 leading-tight">{user.email}</span>
            </div>
          </div>

          <form action={logout}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 text-xs"
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
