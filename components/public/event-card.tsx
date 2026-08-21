import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBdt } from "@/lib/utils";

const EVENT_TYPE_LABELS: Record<string, string> = {
  LIVE_CLASS: "Live class",
  TRAINING_PROGRAM: "Training program",
  WORKSHOP: "Workshop",
  SEMINAR: "Seminar",
};

export function EventCard({
  event,
}: {
  event: {
    slug: string;
    title: string;
    shortDescription: string;
    type: string;
    priceBdt: number;
    startAt: Date;
    thumbnailUrl?: string | null;
    category: { name: string };
    instructor: { name: string; slug: string };
  };
}) {
  return (
    <Card className="group relative h-full flex flex-col overflow-hidden border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10">
      <Link
        href={`/events/${event.slug}`}
        className="absolute inset-0 z-10"
        aria-label={event.title}
      />
      <div className="relative">
        {event.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.thumbnailUrl} alt="" className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 transition-transform duration-500 group-hover:scale-105">
            <span className="text-xl font-bold tracking-tight text-white/80">
              {EVENT_TYPE_LABELS[event.type] ?? event.type}
            </span>
          </div>
        )}
        <div className="absolute top-3 left-3 z-20">
          <Badge className="bg-white/90 text-indigo-700 hover:bg-white backdrop-blur-sm font-semibold shadow-sm border-none">
            {EVENT_TYPE_LABELS[event.type] ?? event.type}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-3 pt-5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-days"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
            <span>
              {event.startAt.toLocaleDateString("en-GB", {
                month: "short",
                day: "numeric",
                year: "numeric"
              })}
            </span>
          </div>
          <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            {event.priceBdt === 0 ? "Free" : formatBdt(event.priceBdt)}
          </span>
        </div>
        <CardTitle className="line-clamp-2 text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
          {event.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 justify-between gap-4">
        <p className="line-clamp-2 text-sm text-slate-600">{event.shortDescription}</p>
        
        <div className="flex flex-col gap-4 mt-auto">
          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-semibold text-xs shrink-0 overflow-hidden">
              {event.instructor.name.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-500">Instructor</span>
              <Link
                href={`/instructors/${event.instructor.slug}`}
                className="relative z-20 text-sm font-semibold text-slate-900 hover:text-indigo-600 transition-colors"
              >
                {event.instructor.name}
              </Link>
            </div>
          </div>
          
          <Link
            href={`/events/${event.slug}`}
            className="relative z-20 w-full rounded-lg bg-indigo-600 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-500/20 active:scale-[0.98]"
          >
            Book Now
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
