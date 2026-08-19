"use client";

import { useActionState } from "react";

import { updateSettings } from "@/lib/settings/actions";

type Settings = {
  siteName: string;
  defaultTimeZone: string;
  currency: string;
  seatHoldMinutes: number;
  joinWindowBeforeMinutes: number;
  joinWindowAfterMinutes: number;
  bkashNagadReceivingMsisdn: string;
  maintenanceMode: boolean;
  contactEmail: string | null;
  contactPhone: string | null;
  facebookUrl: string | null;
  linkedinUrl: string | null;
  emailFromName: string | null;
  emailFromAddress: string | null;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  smtpPassword: string | null;
  termsContent: string | null;
  privacyContent: string | null;
  refundContent: string | null;
};

const FIELD_KEYS = [
  "siteName",
  "defaultTimeZone",
  "currency",
  "seatHoldMinutes",
  "joinWindowBeforeMinutes",
  "joinWindowAfterMinutes",
  "bkashNagadReceivingMsisdn",
  "maintenanceMode",
  "contactEmail",
  "contactPhone",
  "facebookUrl",
  "linkedinUrl",
  "emailFromName",
  "emailFromAddress",
  "smtpHost",
  "smtpPort",
  "smtpUser",
  "smtpPassword",
  "termsContent",
  "privacyContent",
  "refundContent",
] as const satisfies readonly (keyof Settings)[];

function inputClass() {
  return "w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none";
}

function hiddenValue(value: string | number | boolean | null) {
  if (value === null) return "";
  return String(value);
}

export function SettingsForm({
  settings,
  visible,
}: {
  settings: Settings;
  visible: (keyof Settings)[];
}) {
  const [state, action, pending] = useActionState(updateSettings, null);
  const isVisible = (key: keyof Settings) => visible.includes(key);

  return (
    <form action={action} className="flex max-w-lg flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6">
      {isVisible("siteName") && (
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-slate-600">Site name</span>
          <input name="siteName" defaultValue={settings.siteName} className={inputClass()} required />
        </label>
      )}
      {isVisible("defaultTimeZone") && (
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-slate-600">Default time zone</span>
          <input name="defaultTimeZone" defaultValue={settings.defaultTimeZone} className={inputClass()} required />
        </label>
      )}
      {isVisible("currency") && (
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-slate-600">Currency</span>
          <input name="currency" defaultValue={settings.currency} className={inputClass()} required />
        </label>
      )}
      {isVisible("maintenanceMode") && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="maintenanceMode"
            defaultChecked={settings.maintenanceMode}
            className="size-4 rounded border-slate-300 bg-slate-50"
          />
          <span className="text-slate-700">Maintenance mode</span>
        </label>
      )}
      {isVisible("seatHoldMinutes") && (
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-slate-600">Seat hold duration (minutes)</span>
          <input
            type="number"
            name="seatHoldMinutes"
            defaultValue={settings.seatHoldMinutes}
            min={1}
            max={180}
            className={inputClass()}
            required
          />
        </label>
      )}
      {isVisible("joinWindowBeforeMinutes") && (
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-slate-600">Join window opens before start (minutes)</span>
          <input
            type="number"
            name="joinWindowBeforeMinutes"
            defaultValue={settings.joinWindowBeforeMinutes}
            min={0}
            max={180}
            className={inputClass()}
            required
          />
        </label>
      )}
      {isVisible("joinWindowAfterMinutes") && (
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-slate-600">Join window closes after end (minutes)</span>
          <input
            type="number"
            name="joinWindowAfterMinutes"
            defaultValue={settings.joinWindowAfterMinutes}
            min={0}
            max={180}
            className={inputClass()}
            required
          />
        </label>
      )}
      {isVisible("bkashNagadReceivingMsisdn") && (
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-slate-600">bKash/Nagad receiving number</span>
          <input
            name="bkashNagadReceivingMsisdn"
            defaultValue={settings.bkashNagadReceivingMsisdn}
            className={inputClass()}
            required
          />
        </label>
      )}
      {isVisible("contactEmail") && (
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-slate-600">Contact email</span>
          <input
            type="email"
            name="contactEmail"
            defaultValue={settings.contactEmail ?? ""}
            placeholder="hello@aribait.com"
            className={inputClass()}
          />
        </label>
      )}
      {isVisible("contactPhone") && (
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-slate-600">Contact phone</span>
          <input
            name="contactPhone"
            defaultValue={settings.contactPhone ?? ""}
            placeholder="01914638653"
            className={inputClass()}
          />
        </label>
      )}
      {isVisible("facebookUrl") && (
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-slate-600">Facebook URL</span>
          <input
            type="url"
            name="facebookUrl"
            defaultValue={settings.facebookUrl ?? ""}
            placeholder="https://facebook.com/aribait"
            className={inputClass()}
          />
        </label>
      )}
      {isVisible("linkedinUrl") && (
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-slate-600">LinkedIn URL</span>
          <input
            type="url"
            name="linkedinUrl"
            defaultValue={settings.linkedinUrl ?? ""}
            placeholder="https://linkedin.com/company/aribait"
            className={inputClass()}
          />
        </label>
      )}
      {isVisible("emailFromName") && (
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-slate-600">Email sender name</span>
          <input
            name="emailFromName"
            defaultValue={settings.emailFromName ?? ""}
            placeholder="Ariba IT"
            className={inputClass()}
          />
        </label>
      )}
      {isVisible("emailFromAddress") && (
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-slate-600">Email sender address</span>
          <input
            type="email"
            name="emailFromAddress"
            defaultValue={settings.emailFromAddress ?? ""}
            placeholder="no-reply@aribait.com"
            className={inputClass()}
          />
        </label>
      )}
      
      {isVisible("smtpHost") && (
        <div className="mt-4 flex flex-col gap-4 border-t border-slate-200 pt-4">
          <h3 className="font-medium text-slate-900">SMTP Configuration</h3>
          
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-slate-600">SMTP Host</span>
            <input
              name="smtpHost"
              defaultValue={settings.smtpHost ?? ""}
              placeholder="smtp.resend.com"
              className={inputClass()}
            />
          </label>
          
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-slate-600">SMTP Port</span>
            <input
              type="number"
              name="smtpPort"
              defaultValue={settings.smtpPort ?? ""}
              placeholder="465"
              className={inputClass()}
            />
          </label>
          
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-slate-600">SMTP Username</span>
            <input
              name="smtpUser"
              defaultValue={settings.smtpUser ?? ""}
              placeholder="resend"
              className={inputClass()}
            />
          </label>
          
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-slate-600">SMTP Password</span>
            <input
              type="password"
              name="smtpPassword"
              defaultValue={settings.smtpPassword ?? ""}
              placeholder="••••••••••••••••"
              className={inputClass()}
            />
          </label>
        </div>
      )}

      {isVisible("termsContent") && (
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-slate-600">Terms of service — shown at /terms</span>
          <textarea
            name="termsContent"
            defaultValue={settings.termsContent ?? ""}
            rows={10}
            className={inputClass()}
          />
        </label>
      )}
      {isVisible("privacyContent") && (
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-slate-600">Privacy policy — shown at /privacy</span>
          <textarea
            name="privacyContent"
            defaultValue={settings.privacyContent ?? ""}
            rows={10}
            className={inputClass()}
          />
        </label>
      )}
      {isVisible("refundContent") && (
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-slate-600">Refund policy — shown at /refund-policy</span>
          <textarea
            name="refundContent"
            defaultValue={settings.refundContent ?? ""}
            rows={10}
            className={inputClass()}
          />
        </label>
      )}

      {FIELD_KEYS.filter((key) => !isVisible(key)).map((key) =>
        key === "maintenanceMode" ? (
          settings.maintenanceMode ? <input key={key} type="hidden" name={key} value="on" /> : null
        ) : (
          <input key={key} type="hidden" name={key} value={hiddenValue(settings[key])} />
        ),
      )}

      {state?.ok === false && <p className="text-sm text-red-400">{state.error}</p>}
      {state?.ok === true && <p className="text-sm text-emerald-400">Saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-gradient-to-r from-blue-500 to-green-600 px-4 py-2 text-sm font-semibold text-slate-900 hover:from-blue-400 hover:to-green-500 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
