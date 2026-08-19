import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OVERVIEW_CARDS = [
  { label: "Total students", value: 0 },
  { label: "Active Events", value: 0 },
  { label: "Upcoming Sessions", value: 0 },
  { label: "Confirmed registrations", value: 0 },
  { label: "Available seats", value: 0 },
  { label: "Pending payments", value: 0 },
];

export default function AdminOverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {OVERVIEW_CARDS.map((card) => (
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
