"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { registerFree } from "@/lib/registrations/actions";
import { Button } from "@/components/ui/button";

export function RegisterButton({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <Button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const res = await registerFree(eventId);
            if (res.ok) {
              router.push(`/booking/success?registration=${res.registrationId}`);
            } else {
              setError(res.error);
            }
          })
        }
      >
        {pending ? "Registering…" : "Register Free"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
