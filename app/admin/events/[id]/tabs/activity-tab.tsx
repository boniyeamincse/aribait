import { getEventActivityLog } from "@/lib/admin/event-detail";

export async function ActivityTab({ eventId }: { eventId: string }) {
  const entries = await getEventActivityLog(eventId);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-200/50">
      {entries.length === 0 ? (
        <p className="p-5 text-sm text-slate-600">No recorded admin activity for this Event yet.</p>
      ) : (
        entries.map((entry) => (
          <div key={entry.id} className="flex flex-col gap-1 px-4 py-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-700">{entry.summary}</span>
              <span className="whitespace-nowrap text-xs text-slate-600">
                {entry.createdAt.toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}
              </span>
            </div>
            <span className="text-xs text-slate-500">
              {entry.actor.name ?? entry.actor.email} · {entry.action}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
