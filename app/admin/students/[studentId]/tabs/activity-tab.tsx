import { getStudentActivity } from "@/lib/admin/student-detail";

export async function ActivityTab({ userId }: { userId: string }) {
  const entries = await getStudentActivity(userId);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 divide-y divide-slate-800/50">
      {entries.length === 0 ? (
        <p className="p-5 text-sm text-slate-600">No activity yet.</p>
      ) : (
        entries.map((entry, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 text-sm">
            <span className="flex-1 text-slate-300">{entry.text}</span>
            <span className="whitespace-nowrap text-xs text-slate-600">
              {entry.at.toLocaleString("en-US", { timeZone: "Asia/Dhaka", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
