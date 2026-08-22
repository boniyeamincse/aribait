"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Users, Link as LinkIcon, Video, AlertCircle } from "lucide-react";

import { AdminTable } from "@/components/admin/admin-table";
import { SessionStatusDropdown } from "./session-status-dropdown";
import { EditMeetingModal } from "./edit-meeting-modal";

import type { EventSession, Event, Instructor, SessionStatus } from "@/lib/generated/prisma/client";

type SessionWithRelations = EventSession & {
  event: Pick<Event, "title" | "slug">;
  hostInstructor: Pick<Instructor, "name"> | null;
  _count: { attendances: number };
};

export function SessionsClient({ sessions }: { sessions: SessionWithRelations[] }) {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>("UPCOMING_AND_TODAY");

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      // Status Filter
      if (statusFilter !== "ALL" && s.status !== statusFilter) return false;

      // Date Filter
      const now = new Date();
      const start = new Date(s.startAt);
      
      // Reset times for day comparison
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const sessionDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());

      if (dateFilter === "UPCOMING_AND_TODAY") {
        if (sessionDay < today && s.status !== "LIVE" && s.status !== "JOIN_OPEN") return false;
      } else if (dateFilter === "TODAY") {
        if (sessionDay.getTime() !== today.getTime()) return false;
      } else if (dateFilter === "PAST") {
        if (sessionDay >= today) return false;
      }

      return true;
    });
  }, [sessions, statusFilter, dateFilter]);

  // Dashboard Stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayClassesCount = sessions.filter(
    (s) => new Date(s.startAt).setHours(0, 0, 0, 0) === today.getTime()
  ).length;
  
  const liveCount = sessions.filter((s) => s.status === "LIVE" || s.status === "JOIN_OPEN").length;
  
  const missingAttendance = sessions.filter(
    (s) => s.status === "COMPLETED" && s._count.attendances === 0
  ).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Video size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Today&apos;s Classes</p>
            <p className="text-2xl font-bold text-slate-900">{todayClassesCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-200 text-emerald-700">
            <div className="h-3 w-3 animate-ping rounded-full bg-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-700">Live Now</p>
            <p className="text-2xl font-bold text-emerald-900">{liveCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-700">Missing Attendance</p>
            <p className="text-2xl font-bold text-amber-900">{missingAttendance}</p>
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">Session Directory</h2>
          <div className="flex gap-2">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            >
              <option value="ALL">All Time</option>
              <option value="UPCOMING_AND_TODAY">Upcoming & Today</option>
              <option value="TODAY">Today Only</option>
              <option value="PAST">Past Sessions</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            >
              <option value="ALL">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="JOIN_OPEN">Join Open</option>
              <option value="LIVE">Live Now</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <AdminTable
          rowKey={(s) => s.id}
          rows={filteredSessions}
          emptyMessage="No sessions found for the selected filters."
          columns={[
            {
              key: "datetime",
              label: "Date & Time",
              render: (s) => (
                <div className="flex flex-col">
                  <span className="font-medium text-slate-900">
                    {new Date(s.startAt).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(s.startAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} - {new Date(s.endAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </span>
                </div>
              ),
            },
            {
              key: "course",
              label: "Course & Topic",
              render: (s) => (
                <div className="flex flex-col max-w-[250px]">
                  <Link 
                    href={`/admin/events/${s.eventId}`}
                    className="truncate text-xs font-semibold text-indigo-600 hover:underline"
                    title={s.event.title}
                  >
                    {s.event.title}
                  </Link>
                  <span className="truncate text-sm font-medium text-slate-900" title={s.title}>
                    Session {s.sequence}: {s.title}
                  </span>
                </div>
              ),
            },
            {
              key: "instructor",
              label: "Instructor",
              render: (s) => (
                <span className="text-sm text-slate-700">
                  {s.hostInstructor?.name ?? "—"}
                </span>
              ),
            },
            {
              key: "platform",
              label: "Platform & Link",
              render: (s) => (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {s.platform.replace("_", " ")}
                  </span>
                  {s.meetingUrl ? (
                    <a
                      href={s.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      <LinkIcon size={12} /> Join Link
                    </a>
                  ) : (
                    <span className="text-xs italic text-slate-400">No link added</span>
                  )}
                </div>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (s) => (
                <SessionStatusDropdown sessionId={s.id} currentStatus={s.status} />
              ),
            },
            {
              key: "actions",
              label: "Quick Actions",
              render: (s) => (
                <div className="flex items-center gap-2">
                  <EditMeetingModal
                    sessionId={s.id}
                    currentUrl={s.meetingUrl}
                    currentId={s.meetingId}
                    currentPasscode={s.meetingPasscode}
                  />
                  <Link
                    href={`/admin/attendance/${s.id}`}
                    className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-indigo-600"
                  >
                    <Users size={14} />
                    <span>Attendance</span>
                  </Link>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
