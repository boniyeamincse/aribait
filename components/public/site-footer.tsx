import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db/client";
import { Facebook, Linkedin, Youtube, MessageCircle } from "lucide-react";

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
                  <Facebook size={20} />
                </a>
              )}
              {settings?.linkedinUrl && (
                <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-400 transition-colors">
                  <Linkedin size={20} />
                </a>
              )}
              {settings?.youtubeUrl && (
                <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-red-500 transition-colors">
                  <Youtube size={22} />
                </a>
              )}
              {settings?.whatsappUrl && (
                <a href={settings.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  <MessageCircle size={20} />
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
