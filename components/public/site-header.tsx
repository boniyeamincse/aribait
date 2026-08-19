import Link from "next/link";
import Image from "next/image";

import { auth } from "@/lib/auth";
import { logout } from "@/lib/auth/logout-action";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "@/components/public/mobile-menu";

export async function SiteHeader() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo.png"
            alt="Ariba IT Logo"
            width={110}
            height={34}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop nav — hidden on mobile */}
        <nav className="hidden sm:flex items-center gap-5 text-sm">
          <Link href="/events" className="text-slate-400 transition-colors hover:text-white">
            Events
          </Link>
          <Link href="/training" className="text-slate-400 transition-colors hover:text-white">
            Training
          </Link>
          <Link href="/schedule" className="text-slate-400 transition-colors hover:text-white">
            Schedule
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                href={isAdmin ? "/admin" : "/dashboard"}
                className="text-slate-400 transition-colors hover:text-white"
              >
                Dashboard
              </Link>
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
            </>
          ) : (
            <>
              <Link href="/login" className="text-slate-400 transition-colors hover:text-white">
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 px-3 py-1.5 text-sm font-medium text-white transition-all hover:from-cyan-400 hover:to-violet-500"
              >
                Register
              </Link>
            </>
          )}
        </nav>

        {/* Mobile hamburger — client component, shown only on mobile */}
        <MobileMenu isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
      </div>
    </header>
  );
}
