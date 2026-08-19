import Image from "next/image";
import Link from "next/link";

import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db/client";
import { logout } from "@/lib/auth/logout-action";
import { requireAdmin } from "@/lib/permissions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  const pendingPaymentsCount = await prisma.paymentTransaction.count({
    where: { status: "PENDING" },
  });

  const initials = (user.name ?? user.email ?? "A")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <AdminMobileNav pendingPaymentsCount={pendingPaymentsCount} />
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Ariba IT"
              width={110}
              height={34}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
          <span className="hidden rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-xs font-semibold text-violet-400 sm:block">
            Admin
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-slate-500 md:block">
            {user.name ?? user.email}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-600 text-xs font-bold text-white">
            {initials}
          </div>
          <form action={logout}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="border-slate-700 bg-transparent text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Log out
            </Button>
          </form>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden md:flex md:w-64 md:shrink-0 md:flex-col md:border-r md:border-slate-800">
          <AdminNav pendingPaymentsCount={pendingPaymentsCount} />
        </aside>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
