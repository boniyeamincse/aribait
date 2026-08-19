import { AdminTable } from "@/components/admin/admin-table";
import { getEventNotifications } from "@/lib/admin/event-detail";

export async function NotificationsTab({ eventId }: { eventId: string }) {
  const notifications = await getEventNotifications(eventId);

  return (
    <AdminTable
      rowKey={(n) => n.id}
      rows={notifications}
      emptyMessage="No notifications sent for this Event yet."
      columns={[
        {
          key: "recipient",
          label: "Recipient",
          render: (n) => n.user.name ?? n.user.email,
        },
        { key: "type", label: "Type", render: (n) => n.type.replace(/_/g, " ") },
        { key: "title", label: "Title", render: (n) => n.title },
        {
          key: "sent",
          label: "Sent",
          render: (n) => n.createdAt.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }),
        },
        {
          key: "status",
          label: "Status",
          render: (n) =>
            n.readAt ? (
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                Read
              </span>
            ) : (
              <span className="rounded-full border border-slate-500/30 bg-slate-500/15 px-2.5 py-0.5 text-xs font-semibold text-slate-400">
                Unread
              </span>
            ),
        },
      ]}
    />
  );
}
