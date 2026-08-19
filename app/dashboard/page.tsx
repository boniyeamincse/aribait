import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/permissions";

export default async function DashboardOverviewPage() {
  const user = await requireUser();

  const [
    enrolledEvents,
    upcomingSessions,
    completedEvents,
    pendingPayments,
    unreadNotifications,
  ] = await Promise.all([
    prisma.registration.count({
      where: { userId: user.id, status: "CONFIRMED" },
    }),
    prisma.eventSession.count({
      where: {
        startAt: { gte: new Date() },
        status: { in: ["SCHEDULED", "JOIN_OPEN", "LIVE", "RESCHEDULED"] },
        event: {
          registrations: { some: { userId: user.id, status: "CONFIRMED" } },
        },
      },
    }),
    prisma.registration.count({
      where: { userId: user.id, status: "COMPLETED" },
    }),
    prisma.payment.count({
      where: {
        registration: { userId: user.id },
        status: { in: ["INITIATED", "PENDING", "FAILED"] },
      },
    }),
    prisma.notification.count({
      where: { userId: user.id, readAt: null },
    }),
  ]);

  const overviewCards = [
    { label: "Enrolled Events", value: enrolledEvents },
    { label: "Upcoming Sessions", value: upcomingSessions },
    { label: "Completed Events", value: completedEvents },
    { label: "Certificates", value: 0 },
    { label: "Unread notifications", value: unreadNotifications },
    { label: "Pending payments", value: pendingPayments },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {overviewCards.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">
              {card.value}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
