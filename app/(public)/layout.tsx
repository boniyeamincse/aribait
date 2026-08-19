import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/public/site-header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <SiteHeader />
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-2">
              <Image
                src="/logo.png"
                alt="Ariba IT"
                width={120}
                height={36}
                className="mb-4 h-9 w-auto object-contain"
              />
              <p className="max-w-xs text-sm leading-relaxed text-slate-600">
                Bangladesh&apos;s premier live IT and cybersecurity training
                platform. Expert-led sessions via Zoom, Google Meet & Teams.
              </p>
              <p className="mt-4 text-sm text-slate-500">
                01914638653 (bKash/Nagad)
              </p>
            </div>

            {/* Platform links */}
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-700">
                Platform
              </h3>
              <ul className="space-y-2 text-sm text-slate-500">
                {[
                  { label: "Browse Events", href: "/events" },
                  { label: "Training Programs", href: "/training" },
                  { label: "Schedule", href: "/schedule" },
                  { label: "Instructors", href: "/instructors" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="transition-colors hover:text-slate-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal links */}
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-700">
                Company
              </h3>
              <ul className="space-y-2 text-sm text-slate-500">
                {[
                  { label: "About Us", href: "/about" },
                  { label: "Contact", href: "/contact" },
                  { label: "Terms & Conditions", href: "/terms" },
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Refund Policy", href: "/refund-policy" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="transition-colors hover:text-slate-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row">
            <p className="text-xs text-slate-600">
              © {new Date().getFullYear()} Ariba IT. All rights reserved.
            </p>
            <p className="text-xs text-slate-600">
              Live classes · Training · Cybersecurity · Bangladesh
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
