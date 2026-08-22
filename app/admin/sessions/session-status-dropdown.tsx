"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Check, ChevronDown } from "lucide-react";

import { updateSessionStatus } from "@/lib/admin/session-actions";
import type { SessionStatus } from "@/lib/generated/prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_CONFIG: Record<SessionStatus, { label: string; color: string }> = {
  SCHEDULED: { label: "Scheduled", color: "bg-blue-100 text-blue-700 border-blue-200" },
  JOIN_OPEN: { label: "Join Open", color: "bg-amber-100 text-amber-700 border-amber-200" },
  LIVE: { label: "Live Now", color: "bg-emerald-100 text-emerald-700 border-emerald-200 animate-pulse" },
  COMPLETED: { label: "Completed", color: "bg-slate-100 text-slate-700 border-slate-200" },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700 border-red-200" },
  RESCHEDULED: { label: "Rescheduled", color: "bg-purple-100 text-purple-700 border-purple-200" },
};

const STATUS_OPTIONS: SessionStatus[] = [
  "SCHEDULED",
  "JOIN_OPEN",
  "LIVE",
  "COMPLETED",
  "CANCELLED",
  "RESCHEDULED",
];

export function SessionStatusDropdown({
  sessionId,
  currentStatus,
}: {
  sessionId: string;
  currentStatus: SessionStatus;
}) {
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(newStatus: SessionStatus) {
    if (newStatus === currentStatus) return;

    startTransition(async () => {
      const result = await updateSessionStatus(sessionId, newStatus);
      if (result.ok) {
        toast.success(`Session marked as ${STATUS_CONFIG[newStatus].label}.`);
      } else {
        toast.error(result.error);
      }
    });
  }

  const currentConfig = STATUS_CONFIG[currentStatus];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-opacity hover:opacity-80 disabled:opacity-50 ${currentConfig.color}`}
      >
        {isPending ? "Updating..." : currentConfig.label}
        <ChevronDown size={12} className="opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        {STATUS_OPTIONS.map((status) => (
          <DropdownMenuItem
            key={status}
            onClick={() => handleStatusChange(status)}
            className="flex items-center justify-between text-xs"
          >
            {STATUS_CONFIG[status].label}
            {status === currentStatus && <Check size={12} className="text-slate-500" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
