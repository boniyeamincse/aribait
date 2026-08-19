import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Authorized redirect for Event resources — same pattern as the protected
// Session join route: verify a CONFIRMED/COMPLETED registration server-side
// before redirecting, rather than exposing the raw URL to every visitor.
export default async function ViewResourcePage({
  params,
}: PageProps<"/dashboard/resources/[resourceId]/view">) {
  const { resourceId } = await params;
  const user = await requireUser();

  const resource = await prisma.eventResource.findUnique({ where: { id: resourceId } });
  if (!resource) notFound();

  const registration = await prisma.registration.findUnique({
    where: { userId_eventId: { userId: user.id, eventId: resource.eventId } },
  });
  if (
    !registration ||
    (registration.status !== "CONFIRMED" && registration.status !== "COMPLETED")
  ) {
    return (
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Can&apos;t access this resource</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-destructive">
          You need a confirmed registration for this Event.
        </CardContent>
      </Card>
    );
  }

  redirect(resource.url);
}
