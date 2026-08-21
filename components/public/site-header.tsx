import Link from "next/link";
import Image from "next/image";

import { auth } from "@/lib/auth";
import { logout } from "@/lib/auth/logout-action";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "@/components/public/mobile-menu";

import { prisma } from "@/lib/db/client";

export async function SiteHeader() {
  const [session, settings] = await Promise.all([
    auth().catch(() => null),
    prisma.settings.findUnique({ where: { id: 1 }, select: { siteLogoUrl: true, siteName: true } }),
  ]);
  
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;
  const dashboardHref = role === "ADMIN" ? "/admin" : role === "INSTRUCTOR" ? "/instructor" : "/dashboard";

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <Image
            src={settings?.siteLogoUrl || "/logo.png"}
            alt={settings?.siteName || "Ariba IT Logo"}
            width={72}
            height={40}
            className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
            priority
          />
        </Link>

        {/* Desktop nav — hidden on mobile */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <Link href="/" className="transition-colors hover:text-indigo-600">
            Home
          </Link>
          <Link href="/events" className="transition-colors hover:text-indigo-600">
            Courses
          </Link>
          <Link href="/training" className="transition-colors hover:text-indigo-600">
            Certifications
          </Link>
          <Link href="/instructors" className="transition-colors hover:text-indigo-600">
            Mentors
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <Link
                href={dashboardHref}
                className="text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600"
              >
                Dashboard
              </Link>
              <form action={logout}>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="rounded-full border-slate-300 px-5 text-sm font-bold text-slate-700 hover:bg-slate-100"
                >
                  Log out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-bold text-slate-700 transition-colors hover:text-indigo-600 px-3">
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:bg-indigo-700 hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger — client component, shown only on mobile */}
        <div className="md:hidden">
          <MobileMenu isLoggedIn={isLoggedIn} dashboardHref={dashboardHref} />
        </div>
      </div>
    </header>
  );
}
