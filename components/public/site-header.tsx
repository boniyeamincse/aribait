import Link from "next/link";
import Image from "next/image";

import { auth } from "@/lib/auth";
import { logout } from "@/lib/auth/logout-action";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 py-3 backdrop-blur-md">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/logo.png"
          alt="Ariba IT Logo"
          width={120}
          height={36}
          className="h-9 w-auto object-contain"
          priority
        />
      </Link>

      {/* Nav */}
      <nav className="flex items-center gap-5 text-sm">
        <Link
          href="/events"
          className="text-slate-400 transition-colors hover:text-white"
        >
          Events
        </Link>
        <Link
          href="/training"
          className="text-slate-400 transition-colors hover:text-white"
        >
          Training
        </Link>
        <Link
          href="/schedule"
          className="text-slate-400 transition-colors hover:text-white"
        >
          Schedule
        </Link>

        {session?.user ? (
          <>
            <Link
              href={session.user.role === "ADMIN" ? "/admin" : "/dashboard"}
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
            <Link
              href="/login"
              className="text-slate-400 transition-colors hover:text-white"
            >
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
    </header>
  );
}
