import { prisma } from "@/lib/db/client";

export default async function AdminNotificationsPage() {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { name: true, email: true } },
      event: { select: { title: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
        <p className="text-sm text-slate-600">
          Last {notifications.length} in-app notifications sent to students, most recent first.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-widest text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">Recipient</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Event</th>
              <th className="px-4 py-3 text-left">Sent</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {notifications.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-600">
                  No notifications sent yet.
                </td>
              </tr>
            ) : (
              notifications.map((n) => (
                <tr key={n.id} className="border-b border-slate-200/50 hover:bg-slate-100/30">
                  <td className="px-4 py-3 text-slate-700">
                    {n.user.name ?? n.user.email}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{n.type.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-slate-700">{n.title}</td>
                  <td className="px-4 py-3 text-slate-600">{n.event?.title ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {n.createdAt.toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}
                  </td>
                  <td className="px-4 py-3">
                    {n.readAt ? (
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                        Read
                      </span>
                    ) : (
                      <span className="rounded-full border border-slate-500/30 bg-slate-500/15 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                        Unread
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
