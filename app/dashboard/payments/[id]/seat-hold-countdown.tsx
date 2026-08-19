"use client";

import { useEffect, useState } from "react";

export function SeatHoldCountdown({ expiresAt }: { expiresAt: string }) {
  const [remainingMs, setRemainingMs] = useState(() => new Date(expiresAt).getTime() - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingMs(new Date(expiresAt).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (remainingMs <= 0) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
        Your seat hold has expired. Refresh the page to start a new checkout.
      </p>
    );
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return (
    <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700">
      Your seat is reserved for {minutes}:{String(seconds).padStart(2, "0")} minutes. Submit
      payment proof before the hold expires.
    </p>
  );
}
