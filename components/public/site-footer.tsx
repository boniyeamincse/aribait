import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db/client";

export async function SiteFooter() {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });

  return (
    <footer className="bg-slate-950 w-full z-10 relative">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Image
              src="/logo.png"
              alt={settings?.siteName || "Ariba IT"}
              width={140}
              height={42}
              className="mb-6 h-10 w-auto object-contain brightness-0 invert"
            />
            <p className="max-w-sm text-base leading-relaxed text-slate-400">
              Bangladesh&apos;s premier live IT and cybersecurity training
              platform. Expert-led sessions via Zoom, Google Meet & Teams.
            </p>
            <div className="mt-8 flex flex-col gap-2">
              <p className="text-sm font-semibold text-slate-300 uppercase tracking-widest">Contact Support</p>
              <p className="text-lg font-bold text-white">
                {settings?.contactPhone || "01914-638653"} <span className="text-sm font-normal text-slate-500">(bKash/Nagad)</span>
              </p>
              {settings?.contactEmail && (
                <a href={`mailto:${settings.contactEmail}`} className="text-indigo-400 hover:text-indigo-300 transition-colors">
                  {settings.contactEmail}
                </a>
              )}
            </div>

            {/* Social Icons */}
            <div className="mt-6 flex items-center gap-4">
              {settings?.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              )}
              {settings?.linkedinUrl && (
                <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
              )}
              {settings?.youtubeUrl && (
                <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-red-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                </a>
              )}
              {settings?.whatsappUrl && (
                <a href={settings.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-white">
              Platform
            </h3>
            <ul className="space-y-4 text-base font-medium text-slate-400">
              {[
                { label: "Browse Courses", href: "/events" },
                { label: "Certifications", href: "/training" },
                { label: "Class Schedule", href: "/schedule" },
                { label: "Expert Mentors", href: "/instructors" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-indigo-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-white">
              Company
            </h3>
            <ul className="space-y-4 text-base font-medium text-slate-400">
              {[
                { label: "About Us", href: "/about" },
                { label: "Contact Us", href: "/contact" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Refund Policy", href: "/refund-policy" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-indigo-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-slate-800 pt-8 sm:flex-row">
          <p className="text-sm text-slate-500 font-medium">
            © {new Date().getFullYear()} {settings?.siteName || "Ariba IT"}. All rights reserved.
          </p>
          <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
            Made with <span className="text-red-500">♥</span> in Bangladesh
          </p>
        </div>
      </div>
    </footer>
  );
}
