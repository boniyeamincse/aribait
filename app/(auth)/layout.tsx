import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100 overflow-hidden">
      {/* Light Header from Public Layout */}
      <div className="relative z-50">
        <SiteHeader />
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-1/4 -left-1/4 h-[800px] w-[800px] rounded-full bg-indigo-600/20 blur-[120px] mix-blend-screen" />
          <div className="absolute bottom-1/4 -right-1/4 h-[800px] w-[800px] rounded-full bg-cyan-500/20 blur-[120px] mix-blend-screen" />
        </div>

        <div className="relative z-10 w-full max-w-md px-6 py-12 flex flex-col items-center">
          {/* Auth Page Content */}
          <div className="w-full">
            {children}
          </div>
        </div>
      </div>

      {/* Light Footer from Public Layout */}
      <div className="relative z-50">
        <SiteFooter />
      </div>
    </div>
  );
}
