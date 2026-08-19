import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";

export default async function MyAttendancePage() {
  const user = await requireUser();

  const attendances = await prisma.sessionAttendance.findMany({
    where: { registration: { userId: user.id } },
    orderBy: { eventSession: { startAt: "desc" } },
    include: { eventSession: { include: { event: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Attendance</h1>
      <div className="mt-6 divide-y rounded-lg border">
        {attendances.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">
            No attendance records yet — they appear after you join a live
            Session or an admin marks you.
          </p>
        )}
        {attendances.map((attendance) => (
          <div
            key={attendance.id}
            className="flex items-center justify-between gap-4 p-4 text-sm"
          >
            <div>
              <p className="font-medium">
                {attendance.eventSession.event.title} —{" "}
                {attendance.eventSession.title}
              </p>
              <p className="text-muted-foreground">
                {attendance.eventSession.startAt.toLocaleString("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
                {attendance.joinedAt &&
                  ` · joined ${attendance.joinedAt.toLocaleTimeString("en-GB", { timeStyle: "short" })}`}
              </p>
            </div>
            <Badge variant="secondary">{attendance.status ?? "UNMARKED"}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
