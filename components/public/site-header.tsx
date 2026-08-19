import Link from "next/link";

import { auth } from "@/lib/auth";
import { logout } from "@/lib/auth/logout-action";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="flex items-center justify-between border-b px-6 py-4">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        Ariba IT
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/events" className="text-muted-foreground hover:text-foreground">
          Events
        </Link>
        <Link href="/training" className="text-muted-foreground hover:text-foreground">
          Training
        </Link>
        <Link href="/schedule" className="text-muted-foreground hover:text-foreground">
          Schedule
        </Link>
        {session?.user ? (
          <>
            <Link
              href={session.user.role === "ADMIN" ? "/admin" : "/dashboard"}
              className="text-muted-foreground hover:text-foreground"
            >
              Dashboard
            </Link>
            <form action={logout}>
              <Button type="submit" variant="outline" size="sm">
                Log out
              </Button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" className="text-muted-foreground hover:text-foreground">
              Log in
            </Link>
            <Button size="sm" render={<Link href="/register">Register</Link>} />
          </>
        )}
      </nav>
    </header>
  );
}
