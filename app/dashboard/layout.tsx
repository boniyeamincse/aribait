import Link from "next/link";
import Image from "next/image";

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

  const initials = (user.name ?? user.email ?? "?")
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-full flex-col bg-slate-950">
      {/* Top header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 py-3 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Ariba IT"
            width={110}
            height={34}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>

        <div className="flex items-center gap-4">
          {/* User badge */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 text-xs font-bold text-white">
              {initials}
            </div>
            <div className="hidden flex-col sm:flex">
              <span className="text-xs font-medium text-white">
                {user.name ?? "Student"}
              </span>
              <span className="text-xs text-slate-500">{user.email}</span>
            </div>
          </div>

          <form action={logout}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Log out
            </Button>
          </form>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1">
        <DashboardNav />
        <main className="flex-1 p-8 text-white">{children}</main>
      </div>
    </div>
  );
}
