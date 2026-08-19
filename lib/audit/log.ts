import { prisma } from "@/lib/db/client";

/**
 * Append-only audit trail for privileged admin actions (docs/security.md §8).
 * `summary` must never contain secrets — it's a human-readable description,
 * not a data dump.
 */
export async function writeAuditLog(params: {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  summary: string;
}) {
  await prisma.auditLog.create({ data: params });
}
