import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
      {/* ── Left panel — illustration ── */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-10">
        {/* Glow orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-500/10 blur-[80px]" />
          <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-green-500/10 blur-[80px]" />
        </div>

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Ariba IT"
            width={120}
            height={36}
            className="h-9 w-auto object-contain"
            priority
          />
        </Link>

        {/* Illustration */}
        <div className="relative z-10 flex flex-1 items-center justify-center py-8">
          <div className="relative w-full max-w-md">
            {/* Glow behind image */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/20 to-green-500/20 blur-2xl" />
            <Image
              src="/auth-illustration.png"
              alt="Live online cybersecurity training"
              width={600}
              height={450}
              className="relative z-10 w-full rounded-2xl border border-slate-300/50 shadow-2xl shadow-blue-500/10"
              priority
            />
            {/* LIVE badge */}
            <div className="absolute -top-3 left-6 z-20 flex items-center gap-1.5 rounded-full border border-red-500/30 bg-slate-50 px-3 py-1 text-xs font-semibold text-red-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-400" />
              </span>
              LIVE SESSION
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { value: "50+", label: "Live Events" },
            { value: "2,000+", label: "Students" },
            { value: "98%", label: "Satisfaction" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-slate-200 bg-white/60 p-4 text-center backdrop-blur-sm"
            >
              <p className="text-xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex flex-1 flex-col">
        {/* Mobile logo (shown only on small screens) */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 lg:hidden">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Ariba IT"
              width={110}
              height={32}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <Link
            href="/events"
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Browse events
          </Link>
        </div>

        {/* Form area */}
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">{children}</div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} Ariba IT ·{" "}
          <Link href="/terms" className="hover:text-slate-600 transition-colors">
            Terms
          </Link>{" "}
          ·{" "}
          <Link href="/privacy" className="hover:text-slate-600 transition-colors">
            Privacy
          </Link>
        </div>
      </div>
    </div>
  );
}
