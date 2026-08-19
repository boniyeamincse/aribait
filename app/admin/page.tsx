import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db/client";

export default async function AdminOverviewPage() {
  const [
    totalStudents,
    activeEvents,
    upcomingSessions,
    confirmedRegistrations,
    pendingPayments,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.event.count({ where: { status: "PUBLISHED" } }),
    prisma.eventSession.count({
      where: {
        startAt: { gte: new Date() },
        status: { in: ["SCHEDULED", "JOIN_OPEN", "LIVE", "RESCHEDULED"] },
      },
    }),
    prisma.registration.count({ where: { status: "CONFIRMED" } }),
    prisma.paymentTransaction.count({ where: { status: "PENDING" } }),
  ]);

  const overviewCards = [
    { label: "Total students", value: totalStudents },
    { label: "Active Events", value: activeEvents },
    { label: "Upcoming Sessions", value: upcomingSessions },
    { label: "Confirmed registrations", value: confirmedRegistrations },
    { label: "Available seats", value: "—" },
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
