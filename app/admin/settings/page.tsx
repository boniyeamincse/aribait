import type { Metadata } from "next";
import {
  Building2,
  Phone,
  Globe,
  ClipboardList,
  Timer,
  Video,
  CreditCard,
  Mail,
  MonitorPlay,
  Award,
  FileText,
  ShieldCheck,
  Plug,
  AlertTriangle,
  Users,
} from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { prisma } from "@/lib/db/client";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = {
  title: "Settings — Ariba IT Admin",
  description: "Platform-wide configuration for Ariba IT.",
};

const TABS = [
  { id: "general",      label: "General Branding",      icon: Building2     },
  { id: "contact",      label: "Contact & Social",       icon: Phone         },
  { id: "locale",       label: "Timezone & Currency",    icon: Globe         },
  { id: "registration", label: "Registration",           icon: ClipboardList },
  { id: "seat-hold",    label: "Seat Hold",              icon: Timer         },
  { id: "sessions",     label: "Join Window",            icon: Video         },
  { id: "payments",     label: "Payment Providers",      icon: CreditCard    },
  { id: "email",        label: "Email & Templates",      icon: Mail          },
  { id: "meeting",      label: "Meeting Providers",      icon: MonitorPlay   },
  { id: "certificates", label: "Certificates",           icon: Award         },
  { id: "policies",     label: "Terms & Policies",       icon: FileText      },
  { id: "admins",       label: "Admin Users",            icon: Users         },
  { id: "security",     label: "Security",               icon: ShieldCheck   },
  { id: "integrations", label: "Integration Health",     icon: Plug          },
  { id: "maintenance",  label: "Maintenance Mode",       icon: AlertTriangle },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default async function AdminSettingsPage(
  props: PageProps<"/admin/settings">
) {
  const searchParams = await props.searchParams;
  const tab: TabId =
    typeof searchParams.tab === "string" &&
    TABS.some((t) => t.id === searchParams.tab)
      ? (searchParams.tab as TabId)
      : "general";

  const [settings, adminCount] = await Promise.all([
    prisma.settings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
  ]);

  const activeTab = TABS.find((t) => t.id === tab)!;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Settings"
        description="Platform-wide configuration. Changes take effect immediately."
      />

      {/* Tab navigation */}
      <div className="flex flex-wrap gap-1 rounded-2xl border border-slate-800 bg-slate-900 p-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = t.id === tab;
          return (
            <a
              key={t.id}
              href={`/admin/settings?tab=${t.id}`}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-violet-500/20 to-cyan-500/10 text-white border border-violet-500/20"
                  : "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
              }`}
            >
              <Icon size={14} strokeWidth={isActive ? 2 : 1.5} />
              <span className="hidden sm:inline">{t.label}</span>
            </a>
          );
        })}
      </div>

      {/* Active tab heading */}
      <div className="flex items-center gap-3">
        {(() => {
          const Icon = activeTab.icon;
          return (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/10 border border-violet-500/20">
              <Icon size={18} className="text-violet-400" />
            </div>
          );
        })()}
        <div>
          <h2 className="text-lg font-semibold text-white">{activeTab.label}</h2>
        </div>
      </div>

      {/* ── Tab content ── */}

      {tab === "general" && (
        <SettingsSection description="Site name and branding displayed across all public and dashboard pages.">
          <SettingsForm settings={settings} visible={["siteName"]} />
        </SettingsSection>
      )}

      {tab === "contact" && (
        <SettingsSection description="Contact details and social links shown in the public footer and contact page.">
          <SettingsForm
            settings={settings}
            visible={["contactEmail", "contactPhone", "facebookUrl", "linkedinUrl"]}
          />
        </SettingsSection>
      )}

      {tab === "locale" && (
        <SettingsSection description="Default timezone used for all session scheduling and reports. Currency symbol used in pricing display.">
          <SettingsForm
            settings={settings}
            visible={["defaultTimeZone", "currency"]}
          />
        </SettingsSection>
      )}

      {tab === "registration" && (
        <SettingsSection description="Controls how students register for events. These rules apply platform-wide unless overridden per-event.">
          <InfoCard>
            Per-event registration rules (email verification requirement,
            cancellation policy, terms acceptance) are configured on each
            Event&apos;s edit page. Platform defaults can be added to the Settings
            model in a future release.
          </InfoCard>
        </SettingsSection>
      )}

      {tab === "seat-hold" && (
        <SettingsSection description="How long a seat is temporarily reserved during paid checkout before it expires and is released back to the pool.">
          <SettingsForm settings={settings} visible={["seatHoldMinutes"]} />
          <HintCard icon="⏱️">
            Current default: <strong>{settings.seatHoldMinutes} minutes</strong>. 
            Students must submit payment proof within this window. After expiry the 
            seat is released and the registration moves to EXPIRED.
          </HintCard>
        </SettingsSection>
      )}

      {tab === "sessions" && (
        <SettingsSection description="Controls when the Join button becomes active for each live session.">
          <SettingsForm
            settings={settings}
            visible={["joinWindowBeforeMinutes", "joinWindowAfterMinutes"]}
          />
          <HintCard icon="🕐">
            Join opens <strong>{settings.joinWindowBeforeMinutes} min</strong> before 
            start and closes <strong>{settings.joinWindowAfterMinutes} min</strong> after 
            the scheduled end time.
          </HintCard>
        </SettingsSection>
      )}

      {tab === "payments" && (
        <SettingsSection description="Manual bKash/Nagad payment configuration. Students send money to this number and submit proof for admin review.">
          <SettingsForm
            settings={settings}
            visible={["bkashNagadReceivingMsisdn"]}
          />
          <HintCard icon="💳">
            This number is displayed to students during paid checkout. Ensure it 
            is a personal Send Money account. Automated gateway integration is 
            deferred to a future phase.
          </HintCard>
          <InfoCard>
            <strong>Automated payment gateways</strong> (SSLCommerz, ShurjoPay, 
            Stripe) are planned for a future phase. The payment adapter 
            abstraction in{" "}
            <code className="rounded bg-slate-800 px-1 py-0.5 text-xs text-cyan-400">
              lib/payments/
            </code>{" "}
            is designed to accept a real gateway without changing the 
            registration or seat logic.
          </InfoCard>
        </SettingsSection>
      )}

      {tab === "email" && (
        <SettingsSection description="Sender identity used on every transactional email and full SMTP configuration for outgoing emails.">
          <SettingsForm 
            settings={settings} 
            visible={["emailFromName", "emailFromAddress", "smtpHost", "smtpPort", "smtpUser", "smtpPassword"]} 
          />
          <InfoCard>
            This SMTP configuration will be used to send all system emails including password resets, 
            verification links, and class reminders. Ensure the credentials are correct or emails will fail silently (logged to console).
          </InfoCard>
        </SettingsSection>
      )}

      {tab === "meeting" && (
        <SettingsSection description="Default meeting platform and account configuration for live sessions.">
          <InfoCard>
            Meeting platforms (Zoom, Google Meet, Microsoft Teams) are set 
            per-session when creating or editing a session. A platform-wide 
            default and Zoom OAuth integration can be added to this settings 
            model in a future phase.
          </InfoCard>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { name: "Zoom", status: "Manual URL", color: "blue" },
              { name: "Google Meet", status: "Manual URL", color: "emerald" },
              { name: "MS Teams", status: "Manual URL", color: "violet" },
            ].map((p) => (
              <div
                key={p.name}
                className="rounded-xl border border-slate-800 bg-slate-900 p-4"
              >
                <p className="font-semibold text-white">{p.name}</p>
                <p className="mt-1 text-xs text-slate-500">{p.status}</p>
                <span className="mt-2 inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                  Phase 2+
                </span>
              </div>
            ))}
          </div>
        </SettingsSection>
      )}

      {tab === "certificates" && (
        <SettingsSection description="Certificate template, numbering, and QR verification configuration.">
          <InfoCard>
            Certificate template design and custom numbering format are fixed 
            for the MVP. The certificate number uses a{" "}
            <code className="rounded bg-slate-800 px-1 py-0.5 text-xs text-cyan-400">
              CERT-YYYYMM-XXXXXX
            </code>{" "}
            pattern with a random QR verification token. Template customization 
            (logo, color, signatory) can be added to this settings model in a 
            future phase.
          </InfoCard>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Format", value: "CERT-YYYYMM-XXXXXX" },
              { label: "Verification", value: "QR code → /certificates/verify/[token]" },
              { label: "Download", value: "PDF via /dashboard/certificates/[id]/download" },
              { label: "Public PII", value: "Name + Event title only" },
            ].map((row) => (
              <div key={row.label} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">{row.label}</p>
                <p className="mt-1 text-sm text-slate-300">{row.value}</p>
              </div>
            ))}
          </div>
        </SettingsSection>
      )}

      {tab === "policies" && (
        <SettingsSection description="Terms of service, privacy policy, and refund policy content — rendered as plain text on the matching public page. Leave blank to show a 'not published yet' notice.">
          <SettingsForm settings={settings} visible={["termsContent"]} />
          <SettingsForm settings={settings} visible={["privacyContent"]} />
          <SettingsForm settings={settings} visible={["refundContent"]} />
        </SettingsSection>
      )}

      {tab === "admins" && (
        <SettingsSection description="Active admin accounts. Full role-based permissions are planned for Phase 6.">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20">
                <Users size={18} className="text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{adminCount}</p>
                <p className="text-sm text-slate-500">
                  Admin account{adminCount === 1 ? "" : "s"} active
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Every admin account currently has full access. Granular roles 
              (Event Manager, Finance Admin, Support Admin, Viewer) are planned 
              per{" "}
              <span className="text-slate-400">idea.md §18</span>.
            </p>
          </div>
          <InfoCard>
            To promote a student to admin or revoke access, update the{" "}
            <code className="rounded bg-slate-800 px-1 py-0.5 text-xs text-cyan-400">
              role
            </code>{" "}
            field directly in the database until the Admin User Management UI 
            is built.
          </InfoCard>
        </SettingsSection>
      )}

      {tab === "security" && (
        <SettingsSection description="Authentication, session and security configuration.">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Password Hashing", value: "bcryptjs (cost factor 12)", status: "ok" },
              { label: "Session Strategy", value: "Database sessions via Auth.js", status: "ok" },
              { label: "Meeting Link Encryption", value: "AES-256-GCM at rest", status: "ok" },
              { label: "Route Protection", value: "Middleware + requireAdmin()/requireUser()", status: "ok" },
              { label: "CRON Secret", value: "CRON_SECRET env var", status: "ok" },
              { label: "Two-Factor Auth (Admin)", value: "Not implemented — Phase 2+", status: "pending" },
              { label: "Rate Limiting", value: "Not implemented — planned", status: "pending" },
              { label: "IP Allowlist (Admin)", value: "Not implemented — planned", status: "pending" },
            ].map((row) => (
              <div key={row.label} className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4">
                <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${row.status === "ok" ? "bg-emerald-400" : "bg-amber-400"}`} />
                <div>
                  <p className="text-sm font-medium text-slate-200">{row.label}</p>
                  <p className="text-xs text-slate-500">{row.value}</p>
                </div>
              </div>
            ))}
          </div>
        </SettingsSection>
      )}

      {tab === "integrations" && (
        <SettingsSection description="Health and configuration status of all external integrations.">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { name: "Neon PostgreSQL",   status: "Connected",   color: "emerald", note: "DATABASE_URL" },
              { name: "Auth.js",           status: "Active",      color: "emerald", note: "AUTH_SECRET" },
              { name: "Email Provider",    status: "Dev mode",    color: "amber",   note: "EMAIL_API_KEY — logs to console in dev" },
              { name: "bKash / Nagad",     status: "Manual",      color: "blue",    note: "No API — admin-reviewed proof" },
              { name: "Zoom API",          status: "Not wired",   color: "slate",   note: "Deferred to Phase 2+" },
              { name: "S3 / File Storage", status: "Placeholder", color: "slate",   note: "STORAGE_* vars not connected" },
              { name: "Error Monitoring",  status: "Not wired",   color: "slate",   note: "Sentry / similar — planned" },
            ].map((item) => {
              const colorMap: Record<string, string> = {
                emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
                amber:   "bg-amber-500/15 text-amber-400 border-amber-500/30",
                blue:    "bg-blue-500/15 text-blue-400 border-blue-500/30",
                slate:   "bg-slate-700/15 text-slate-500 border-slate-700/30",
              };
              return (
                <div key={item.name} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-white">{item.name}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${colorMap[item.color]}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">{item.note}</p>
                </div>
              );
            })}
          </div>
        </SettingsSection>
      )}

      {tab === "maintenance" && (
        <SettingsSection description="When maintenance mode is on, the public site shows a maintenance page and all student actions are blocked. Admin access is unaffected.">
          <SettingsForm settings={settings} visible={["maintenanceMode"]} />
          {settings.maintenanceMode && (
            <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-400" />
              <div>
                <p className="font-semibold text-red-300">Maintenance mode is ON</p>
                <p className="mt-1 text-sm text-red-400/80">
                  The public site is currently unavailable to students. 
                  Turn it off as soon as maintenance is complete.
                </p>
              </div>
            </div>
          )}
        </SettingsSection>
      )}
    </div>
  );
}

/* ── Shared layout helpers ── */

function SettingsSection({
  description,
  children,
}: {
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-400">{description}</p>
      {children}
    </div>
  );
}

function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-2xl rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-400 leading-relaxed">
      {children}
    </div>
  );
}

function HintCard({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="flex max-w-2xl items-start gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-sm text-cyan-300">
      <span className="text-lg">{icon}</span>
      <p>{children}</p>
    </div>
  );
}
