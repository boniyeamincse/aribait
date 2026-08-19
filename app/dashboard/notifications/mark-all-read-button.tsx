"use client";

import { useTransition } from "react";

import { markAllNotificationsRead } from "@/lib/notifications/actions";
import { Button } from "@/components/ui/button";

export function MarkAllReadButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() => startTransition(() => markAllNotificationsRead())}
    >
      Mark all read
    </Button>
  );
}
