import Link from "next/link";

import { prisma } from "@/lib/db/client";
import { Badge } from "@/components/ui/badge";

export default async function AdminAttendancePage() {
  const sessions = await prisma.eventSession.findMany({
    where: { status: { not: "CANCELLED" } },
    orderBy: { startAt: "desc" },
    take: 100,
    include: {
      event: true,
      _count: {
        select: { attendances: { where: { status: { not: null } } } },
      },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Attendance</h1>
      <p className="text-sm text-muted-foreground">
        Pick a Session to mark or review attendance.
      </p>

      <div className="divide-y rounded-lg border">
        {sessions.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">No Sessions yet.</p>
        )}
        {sessions.map((session) => (
          <Link
            key={session.id}
            href={`/admin/attendance/${session.id}`}
            className="flex items-center justify-between gap-4 p-4 text-sm hover:bg-accent"
          >
            <div>
              <p className="font-medium">
                {session.event.title} — {session.title}
              </p>
              <p className="text-muted-foreground">
                {session.startAt.toLocaleString("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}{" "}
                · {session._count.attendances} marked
              </p>
            </div>
            <Badge variant="secondary">{session.status}</Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
