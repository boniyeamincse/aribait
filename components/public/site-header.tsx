import Link from "next/link";
import Image from "next/image";

import { auth } from "@/lib/auth";
import { logout } from "@/lib/auth/logout-action";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "@/components/public/mobile-menu";

export async function SiteHeader() {
  const session = await auth().catch(() => null);
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;
  const dashboardHref = role === "ADMIN" ? "/admin" : role === "INSTRUCTOR" ? "/instructor" : "/dashboard";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-slate-50/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo.png"
            alt="Ariba IT Logo"
            width={62}
            height={34}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop nav — hidden on mobile */}
        <nav className="hidden sm:flex items-center gap-5 text-sm">
          <Link href="/" className="text-slate-600 transition-colors hover:text-slate-900">
            Home
          </Link>
          <Link href="/events" className="text-slate-600 transition-colors hover:text-slate-900">
            Events
          </Link>
          <Link href="/training" className="text-slate-600 transition-colors hover:text-slate-900">
            Training
          </Link>
          <Link href="/schedule" className="text-slate-600 transition-colors hover:text-slate-900">
            Schedule
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                href={dashboardHref}
                className="text-slate-600 transition-colors hover:text-slate-900"
              >
                Dashboard
              </Link>
              <form action={logout}>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                >
                  Log out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-slate-600 transition-colors hover:text-slate-900">
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-green-600 px-3 py-1.5 text-sm font-medium text-slate-900 transition-all hover:from-blue-400 hover:to-green-500"
              >
                Register
              </Link>
            </>
          )}
        </nav>

        {/* Mobile hamburger — client component, shown only on mobile */}
        <MobileMenu isLoggedIn={isLoggedIn} dashboardHref={dashboardHref} />
      </div>
    </header>
  );
}
