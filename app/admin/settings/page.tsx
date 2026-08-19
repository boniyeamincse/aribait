import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TabBar } from "@/components/admin/tab-bar";
import { prisma } from "@/lib/db/client";

import { SettingsForm } from "./settings-form";

const TABS = [
  { id: "general", label: "General" },
  { id: "registration", label: "Registration" },
  { id: "payments", label: "Payments" },
  { id: "sessions", label: "Sessions" },
  { id: "certificates", label: "Certificates" },
  { id: "security", label: "Security" },
];

export default async function AdminSettingsPage(props: PageProps<"/admin/settings">) {
  const searchParams = await props.searchParams;
  const tab = typeof searchParams.tab === "string" ? searchParams.tab : "general";

  const [settings, adminCount] = await Promise.all([
    prisma.settings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Settings" description="Platform-wide configuration." />

      <TabBar tabs={TABS} active={tab} baseHref="/admin/settings" />

      {tab === "general" && (
        <SettingsForm settings={settings} visible={["siteName", "defaultTimeZone", "currency", "maintenanceMode"]} />
      )}
      {tab === "registration" && <SettingsForm settings={settings} visible={["seatHoldMinutes"]} />}
      {tab === "payments" && <SettingsForm settings={settings} visible={["bkashNagadReceivingMsisdn"]} />}
      {tab === "sessions" && (
        <SettingsForm settings={settings} visible={["joinWindowBeforeMinutes", "joinWindowAfterMinutes"]} />
      )}
      {tab === "certificates" && (
        <div className="max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400">
          Certificate template and QR verification behavior are fixed for the MVP — no configurable options yet.
        </div>
      )}
      {tab === "security" && (
        <div className="max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400">
          <p>{adminCount} admin account{adminCount === 1 ? "" : "s"} currently active.</p>
          <p className="mt-2">
            Role and permission management is not built yet — every admin account has full access. See{" "}
            <span className="text-slate-300">idea.md §18</span> for the planned roles model.
          </p>
        </div>
      )}
    </div>
  );
}
