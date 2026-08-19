import { prisma } from "@/lib/db/client";
import { Badge } from "@/components/ui/badge";

export default async function AdminAuditLogsPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { actor: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Audit Logs</h1>
      <p className="text-sm text-muted-foreground">
        Append-only record of privileged admin actions.
      </p>

      <div className="divide-y rounded-lg border">
        {logs.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">No entries yet.</p>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex items-start justify-between gap-4 p-3 text-sm">
            <div>
              <p className="font-medium">{log.summary}</p>
              <p className="text-muted-foreground">
                {log.actor.name} ({log.actor.email}) ·{" "}
                {log.createdAt.toLocaleString("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
            <Badge variant="outline">{log.action}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
