import Link from "next/link";

import { Video, Edit2, Play, AlertCircle, CheckCircle2 } from "lucide-react";

import { createEventSession, cancelEventSession, reactivateEventSession } from "@/lib/events/session-actions";
import type { Instructor, Prisma, SessionStatus } from "@/lib/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { SessionForm } from "../session-form";

type EventWithSessions = Prisma.EventGetPayload<{ include: { sessions: true } }>;

const STATUS_COLORS: Record<SessionStatus, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700 border-blue-200",
  JOIN_OPEN: "bg-amber-100 text-amber-700 border-amber-200",
  LIVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  COMPLETED: "bg-slate-100 text-slate-700 border-slate-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
  RESCHEDULED: "bg-purple-100 text-purple-700 border-purple-200",
};

export function SessionsTab({
  event,
  instructors,
}: {
  event: EventWithSessions;
  instructors: Instructor[];
}) {
  const nextSequence = event.sessions.length + 1;

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start max-w-5xl">
      {/* Main Content Area - Session List */}
      <div className="flex flex-1 flex-col gap-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Event Curriculum ({event.sessions.length})</CardTitle>
                <CardDescription>Manage the schedule and meeting links for each class.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              {event.sessions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-500 mb-3">
                    <Video size={24} />
                  </div>
                  <p className="text-sm font-medium text-slate-900">No sessions scheduled yet</p>
                  <p className="text-sm text-slate-500">Create the first session from the sidebar.</p>
                </div>
              )}
              {event.sessions.map((session) => (
                <div 
                  key={session.id} 
                  className={`flex flex-col gap-4 rounded-xl border p-5 transition-colors ${
                    session.status === 'CANCELLED' ? 'border-red-100 bg-red-50/30 opacity-75' :
                    session.status === 'LIVE' ? 'border-emerald-200 bg-emerald-50/30' :
                    'border-slate-200 bg-white hover:border-indigo-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                          {session.sequence}
                        </span>
                        <h3 className="text-base font-semibold text-slate-900">
                          {session.title}
                        </h3>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-600 pl-8">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Play size={14} className="text-slate-400" />
                          {new Date(session.startAt).toLocaleString("en-GB", { 
                            dateStyle: "medium", 
                            timeStyle: "short" 
                          })}
                        </div>
                        <span className="text-slate-300">•</span>
                        <span className="font-medium text-slate-500 uppercase text-xs tracking-wider">
                          {session.platform.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start pl-8 sm:pl-0">
                      <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full border ${STATUS_COLORS[session.status]}`}>
                        {session.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-2">
                    <Button
                      render={<Link href={`/admin/events/${event.id}/sessions/${session.id}`}>Edit Details</Link>}
                      nativeButton={false}
                      size="sm"
                      variant="outline"
                      className="gap-1.5 h-8 text-xs font-medium"
                    />
                    {session.status !== "CANCELLED" ? (
                      <form action={cancelEventSession.bind(null, session.id)}>
                        <Button type="submit" size="sm" variant="destructive" className="h-8 text-xs font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700 shadow-none">
                          Cancel
                        </Button>
                      </form>
                    ) : (
                      <form action={reactivateEventSession.bind(null, session.id)}>
                        <Button type="submit" size="sm" variant="outline" className="h-8 text-xs font-medium">
                          Reactivate
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar Area - Add Session */}
      <div className="flex w-full flex-col gap-6 lg:w-[380px] shrink-0">
        <Card className="shadow-sm border-slate-200 sticky top-6">
          <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
            <CardTitle className="text-base">Add New Session</CardTitle>
            <CardDescription className="text-xs">Schedule class #{nextSequence} for this event.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <SessionForm
              key={nextSequence}
              action={createEventSession.bind(null, event.id)}
              instructors={instructors}
              nextSequence={nextSequence}
              submitLabel="Create Session"
              defaultValues={{
                title: "",
                sequence: nextSequence,
                description: null,
                startAt: event.startAt,
                endAt: event.endAt,
                timeZone: "Asia/Dhaka",
                hostInstructorId: event.instructorId,
                platform: "ZOOM",
                meetingId: null,
                meetingUrl: null,
                meetingPasscode: null,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
