import Link from "next/link";
import { CheckSquare, Calendar, AlertCircle } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable } from "@/components/admin/admin-table";
import { prisma } from "@/lib/db/client";
import { Button } from "@/components/ui/button";

export default async function AdminAttendancePage() {
  const sessions = await prisma.eventSession.findMany({
    where: { status: { not: "CANCELLED" } },
    orderBy: { startAt: "desc" },
    take: 100,
    include: {
      event: true,
      _count: {
        select: { attendances: { where: { status: { not: null } } } },
      },
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayClassesCount = sessions.filter(
    (s) => new Date(s.startAt).setHours(0, 0, 0, 0) === today.getTime()
  ).length;
  
  const missingAttendance = sessions.filter(
    (s) => s.status === "COMPLETED" && s._count.attendances === 0
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader 
        title="Attendance Management" 
        description="Track and manage student attendance across all live classes." 
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Today&apos;s Classes</p>
            <p className="text-2xl font-bold text-slate-900">{todayClassesCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-200 text-emerald-700">
            <CheckSquare size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-700">Total Classes</p>
            <p className="text-2xl font-bold text-emerald-900">{sessions.length}</p>
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

      {/* Sessions Table */}
      <div className="flex flex-col gap-4">
        <AdminTable
          rowKey={(s) => s.id}
          rows={sessions}
          emptyMessage="No Sessions found."
          columns={[
            {
              key: "session",
              label: "Class Info",
              render: (s) => (
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900">{s.title}</span>
                  <span className="text-xs font-medium text-indigo-600">{s.event.title}</span>
                </div>
              ),
            },
            {
              key: "when",
              label: "Date & Time",
              render: (s) => (
                <div className="flex flex-col">
                  <span className="font-medium text-slate-900">
                    {new Date(s.startAt).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(s.startAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </span>
                </div>
              ),
            },
            { 
              key: "status", 
              label: "Status", 
              render: (s) => (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  s.status === 'LIVE' ? 'bg-emerald-100 text-emerald-700' :
                  s.status === 'COMPLETED' ? 'bg-slate-100 text-slate-700' :
                  s.status === 'JOIN_OPEN' ? 'bg-amber-100 text-amber-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {s.status.replace(/_/g, " ")}
                </span>
              )
            },
            { 
              key: "marked", 
              label: "Marked Count", 
              render: (s) => (
                <span className="font-medium text-slate-900">
                  {s._count.attendances > 0 ? (
                    <span className="text-emerald-600">{s._count.attendances} marked</span>
                  ) : (
                    <span className="text-slate-400">0</span>
                  )}
                </span>
              )
            },
            {
              key: "action",
              label: "Action",
              render: (s) => (
                <Button 
                  render={<Link href={`/admin/attendance/${s.id}`}>Manage</Link>}
                  nativeButton={false}
                  size="sm"
                  variant="outline"
                  className="bg-white"
                />
              )
            }
          ]}
        />
      </div>
    </div>
  );
}
