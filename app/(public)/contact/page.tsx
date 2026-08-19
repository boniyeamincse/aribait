import type { Metadata } from "next";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";

import { prisma } from "@/lib/db/client";

export const metadata: Metadata = {
  title: "Contact Us — Ariba IT",
  description: "Get in touch with Ariba IT — phone, email, address, and our WhatsApp community.",
};

export default async function ContactPage() {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });

  const details = [
    settings?.contactPhone && {
      icon: Phone,
      label: "Phone",
      value: settings.contactPhone,
      href: `tel:${settings.contactPhone.replace(/\s+/g, "")}`,
    },
    settings?.contactEmail && {
      icon: Mail,
      label: "Email",
      value: settings.contactEmail,
      href: `mailto:${settings.contactEmail}`,
    },
    settings?.contactAddress && {
      icon: MapPin,
      label: "Address",
      value: settings.contactAddress,
      href: undefined,
    },
  ].filter((d): d is { icon: typeof Phone; label: string; value: string; href: string | undefined } => Boolean(d));

  return (
    <>
      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-600">
            Get in touch
          </p>
          <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">Contact Us</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
            Questions about an event, a payment, or your registration? Reach us any of the
            following ways.
          </p>

          {details.length > 0 ? (
            <div className="mx-auto mt-12 grid gap-6 sm:grid-cols-3">
              {details.map((d) => {
                const content = (
                  <>
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <d.icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-slate-500">
                      {d.label}
                    </p>
                    <p className="mt-1 text-sm text-slate-900">{d.value}</p>
                  </>
                );
                return d.href ? (
                  <a
                    key={d.label}
                    href={d.href}
                    className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center transition-all hover:border-blue-500/40 hover:shadow-md"
                  >
                    {content}
                  </a>
                ) : (
                  <div
                    key={d.label}
                    className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center"
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-12 text-sm text-slate-500">Contact details coming soon.</p>
          )}
        </div>
      </section>

      {/* Bottom section — WhatsApp community / latest updates */}
      <section className="border-t border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
            <MessageCircle className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">For Latest Updates</h2>
          <p className="mt-2 text-slate-600">
            Join our WhatsApp group for new event announcements, schedule changes, and reminders.
          </p>
          {settings?.whatsappUrl ? (
            <a
              href={settings.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-green-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition-all hover:from-green-500 hover:to-blue-500"
            >
              Click Here to Join Our WhatsApp Group
            </a>
          ) : (
            <p className="mt-6 text-sm text-slate-500">WhatsApp group link coming soon.</p>
          )}
        </div>
      </section>
    </>
  );
}
