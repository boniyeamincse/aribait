import { prisma } from "@/lib/db/client";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SessionsClient } from "./sessions-client";

export default async function AdminSessionsPage() {
  const sessions = await prisma.eventSession.findMany({
    orderBy: { startAt: "asc" },
    include: {
      event: { select: { title: true, slug: true } },
      hostInstructor: { select: { name: true } },
      _count: { select: { attendances: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Master Class Schedule"
        description="Monitor, manage, and update live sessions across all events."
      />
      
      <SessionsClient sessions={sessions} />
    </div>
  );
}
