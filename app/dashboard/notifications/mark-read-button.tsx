"use client";

import { useTransition } from "react";

import { markNotificationRead } from "@/lib/notifications/actions";
import { Button } from "@/components/ui/button";

export function MarkReadButton({ notificationId }: { notificationId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() => startTransition(() => markNotificationRead(notificationId))}
    >
      Mark read
    </Button>
  );
}
