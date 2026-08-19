"use client";

import { useTransition } from "react";

import { cancelRegistration } from "@/lib/registrations/actions";
import { Button } from "@/components/ui/button";

export function CancelRegistrationButton({
  registrationId,
}: {
  registrationId: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await cancelRegistration(registrationId);
        })
      }
    >
      {pending ? "Cancelling…" : "Cancel"}
    </Button>
  );
}
