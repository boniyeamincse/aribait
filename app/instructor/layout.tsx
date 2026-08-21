import Link from "next/link";
import Image from "next/image";

import { requireInstructor } from "@/lib/permissions";
import { logout } from "@/lib/auth/logout-action";
import { Button } from "@/components/ui/button";
import { InstructorNav } from "@/components/instructor/instructor-nav";
import { AvatarBadge } from "@/components/shared/avatar-badge";

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, instructor } = await requireInstructor();

  const initials = (user.name ?? user.email ?? "I")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image src="/logo.png" alt="Ariba IT" width={62} height={34} className="h-8 w-auto object-contain" priority />
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden flex-col items-end sm:flex">
            <span className="text-sm font-medium text-slate-900 leading-tight">{user.name ?? "Instructor"}</span>
            <span className="text-xs text-slate-500 leading-tight">{user.email}</span>
          </div>
          <AvatarBadge
            image={instructor.avatarUrl}
            initials={initials}
            className="h-8 w-8 text-xs bg-gradient-to-br from-green-500 to-blue-600"
          />
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900">
              Log out
            </Button>
          </form>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden md:flex md:w-64 md:shrink-0 md:flex-col">
          <InstructorNav />
        </aside>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 text-slate-900">{children}</main>
      </div>
    </div>
  );
}
