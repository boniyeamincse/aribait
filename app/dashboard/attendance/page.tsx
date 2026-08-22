import { prisma } from "@/lib/db/client";
import { requireUser } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Info, CalendarDays, Clock, ShieldCheck, CheckSquare, XCircle, AlertCircle } from "lucide-react";

export default async function MyAttendancePage() {
  const user = await requireUser();

  const attendances = await prisma.sessionAttendance.findMany({
    where: { registration: { userId: user.id } },
    orderBy: { eventSession: { startAt: "desc" } },
    include: { eventSession: { include: { event: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 shadow-inner">
          <CheckSquare size={20} />
        </div>
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">
          Attendance
        </h1>
      </div>
      <div className="flex items-start gap-3 rounded-2xl bg-indigo-50/50 border border-indigo-100 p-4 backdrop-blur-sm">
        <Info size={20} className="text-indigo-500 shrink-0 mt-0.5" />
        <p className="text-sm text-indigo-900 leading-relaxed font-medium">
          Track your attendance across all registered courses. Records appear after you join a live session or an admin marks your presence.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {attendances.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-white/50 backdrop-blur-md py-16 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 mb-5 shadow-inner">
              <CheckSquare size={28} className="text-sky-400" />
            </div>
            <p className="text-lg font-bold text-slate-800">No records found</p>
            <p className="text-sm text-slate-500 mt-1">You haven&apos;t attended any live sessions yet.</p>
          </div>
        )}
        {attendances.map((attendance) => {
          const status = attendance.status ?? "UNMARKED";
          
          let StatusIcon = ShieldCheck;
          let statusColor = "bg-slate-100 text-slate-600 border-slate-200";
          
          if (status === "PRESENT") {
            StatusIcon = CheckCircle2;
            statusColor = "bg-emerald-50 text-emerald-600 border-emerald-200";
          } else if (status === "ABSENT") {
            StatusIcon = XCircle;
            statusColor = "bg-rose-50 text-rose-600 border-rose-200";
          } else if (status === "LATE") {
            StatusIcon = AlertCircle;
            statusColor = "bg-amber-50 text-amber-600 border-amber-200";
          }

          return (
            <div
              key={attendance.id}
              className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-[1.5rem] border border-white/60 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10 hover:bg-white/80"
            >
              <div className="flex gap-4 items-start">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-inner group-hover:scale-110 transition-transform duration-300 mt-0.5`}>
                   <CheckSquare size={22} className="text-slate-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                    {attendance.eventSession.event.title}
                  </h3>
                  <p className="font-semibold text-slate-700 text-sm mt-0.5">{attendance.eventSession.title}</p>
                  
                  <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1.5 bg-white/80 border border-slate-100 px-2.5 py-1.5 rounded-lg text-slate-700 shadow-sm backdrop-blur-sm">
                      <CalendarDays size={14} className="text-indigo-400" />
                      {attendance.eventSession.startAt.toLocaleString("en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                    {attendance.joinedAt && (
                      <span className="flex items-center gap-1.5 bg-white/80 border border-slate-100 px-2.5 py-1.5 rounded-lg text-slate-700 shadow-sm backdrop-blur-sm">
                        <Clock size={14} className="text-emerald-500" />
                        Joined at {attendance.joinedAt.toLocaleTimeString("en-GB", { timeStyle: "short" })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex shrink-0 items-center sm:self-center mt-2 sm:mt-0 border-t sm:border-t-0 border-slate-200/50 pt-4 sm:pt-0">
                <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-bold text-xs uppercase tracking-wider ${statusColor} shadow-sm backdrop-blur-md`}>
                  <StatusIcon size={16} />
                  {status}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
