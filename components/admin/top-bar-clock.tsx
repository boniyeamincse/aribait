"use client";

import { useEffect, useState } from "react";

export function TopBarClock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      setTime(
        now.toLocaleString("en-GB", {
          timeZone: "Asia/Dhaka",
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    }
    updateClock();
    const interval = setInterval(updateClock, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />;

  return (
    <div className="hidden text-xs font-medium text-slate-500 lg:block">
      {time} (BD)
    </div>
  );
}
