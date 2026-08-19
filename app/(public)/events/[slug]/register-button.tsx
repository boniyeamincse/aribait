"use client";

import { useState, useTransition } from "react";

import { registerFree } from "@/lib/registrations/actions";
import { Button } from "@/components/ui/button";

type Result = { ok: true; waitlisted: boolean } | { ok: false; error: string };

export function RegisterButton({ eventId }: { eventId: string }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<Result | null>(null);

  if (result?.ok) {
    return (
      <p className="text-sm">
        {result.waitlisted
          ? "You're on the waitlist — we'll confirm your seat if one opens up."
          : "You're confirmed! Check your dashboard for session details."}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await registerFree(eventId);
            setResult(res);
          })
        }
      >
        {pending ? "Registering…" : "Register Free"}
      </Button>
      {result?.ok === false && (
        <p className="text-sm text-destructive">{result.error}</p>
      )}
    </div>
  );
}
