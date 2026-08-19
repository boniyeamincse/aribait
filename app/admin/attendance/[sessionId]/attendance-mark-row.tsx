"use client";

import { useTransition } from "react";

import { markAttendance } from "@/lib/attendance/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "PRESENT", label: "Present" },
  { value: "LATE", label: "Late" },
  { value: "ABSENT", label: "Absent" },
  { value: "EXCUSED", label: "Excused" },
] as const;

export function AttendanceMarkRow({
  registrationId,
  eventSessionId,
  currentStatus,
}: {
  registrationId: string;
  eventSessionId: string;
  currentStatus: string | null;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-1">
      {OPTIONS.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="sm"
          variant={currentStatus === option.value ? "default" : "outline"}
          disabled={pending}
          className={cn(currentStatus === option.value && "pointer-events-none")}
          onClick={() =>
            startTransition(async () => {
              await markAttendance(registrationId, eventSessionId, option.value);
            })
          }
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
