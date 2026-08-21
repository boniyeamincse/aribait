"use client";

import { useTransition } from "react";

import { markAttendance } from "@/lib/attendance/actions";

const OPTIONS = [
  { value: "PRESENT", label: "Present", activeClass: "border-emerald-500/40 bg-emerald-500/20 text-emerald-400" },
  { value: "LATE", label: "Late", activeClass: "border-amber-500/40 bg-amber-500/20 text-amber-400" },
  { value: "ABSENT", label: "Absent", activeClass: "border-red-500/40 bg-red-500/20 text-red-400" },
  { value: "EXCUSED", label: "Excused", activeClass: "border-slate-500/40 bg-slate-500/20 text-slate-700" },
] as const;

type Status = (typeof OPTIONS)[number]["value"];

export function AttendanceMarkRow({
  registrationId,
  eventSessionId,
  currentStatus,
  action = markAttendance,
}: {
  registrationId: string;
  eventSessionId: string;
  currentStatus: string | null;
  action?: (registrationId: string, eventSessionId: string, status: Status) => Promise<unknown>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-1.5">
      {OPTIONS.map((option) => {
        const isActive = currentStatus === option.value;
        return (
          <button
            key={option.value}
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await action(registrationId, eventSessionId, option.value);
              })
            }
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
              isActive ? option.activeClass : "border-slate-300 text-slate-500 hover:bg-slate-100"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
