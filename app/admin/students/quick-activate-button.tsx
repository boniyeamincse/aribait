"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { changeStudentStatus } from "@/lib/admin/student-actions";

export function QuickActivateButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleActivate() {
    startTransition(async () => {
      const result = await changeStudentStatus(userId, "ACTIVE");
      if (result.ok) {
        toast.success("Student activated!");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <button
      onClick={handleActivate}
      disabled={isPending}
      className="rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition-all hover:bg-emerald-100 active:scale-95 disabled:opacity-50"
    >
      {isPending ? "…" : "Activate"}
    </button>
  );
}
