import { prisma } from "@/lib/db/client";
import { Badge } from "@/components/ui/badge";
import { formatBdt } from "@/lib/utils";

export default async function AdminRegistrationsPage() {
  const registrations = await prisma.registration.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: true, event: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Registrations</h1>
      <div className="divide-y rounded-lg border">
        {registrations.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">
            No registrations yet.
          </p>
        )}
        {registrations.map((registration) => (
          <div
            key={registration.id}
            className="flex items-center justify-between gap-4 p-4 text-sm"
          >
            <div>
              <p className="font-medium">{registration.event.title}</p>
              <p className="text-muted-foreground">
                {registration.user.name} ({registration.user.email}) ·{" "}
                {formatBdt(registration.priceSnapshotBdt)}
              </p>
            </div>
            <Badge variant="secondary">{registration.status}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
