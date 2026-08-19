import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">
        Live classes, training and events — in one place
      </h1>
      <p className="max-w-xl text-muted-foreground">
        Discover, register and join live cybersecurity and IT training
        delivered over Zoom, Google Meet or Microsoft Teams.
      </p>
      <div className="flex gap-4">
        <Button render={<Link href="/events">Browse Events</Link>} />
        <Button
          variant="outline"
          render={<Link href="/register">Get started</Link>}
        />
      </div>
    </div>
  );
}
