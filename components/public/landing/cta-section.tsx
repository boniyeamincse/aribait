import Link from "next/link";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-green-950/30 to-slate-950 py-24">
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-600/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-sm text-green-300">
          🚀 Start your IT career today
        </div>
        <h2 className="text-4xl font-bold text-slate-900 sm:text-5xl">
          Ready to level up your{" "}
          <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            IT skills?
          </span>
        </h2>
        <p className="mt-5 text-lg text-slate-600">
          Join thousands of Bangladeshi professionals who are building their
          cybersecurity and IT careers with live expert-led training.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-green-600 to-blue-600 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-green-500/25 transition-all hover:from-green-500 hover:to-blue-500"
          >
            Create Free Account
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center justify-center rounded-lg border border-white/25 bg-transparent px-6 py-3 text-sm font-semibold text-slate-900 transition-all hover:bg-white/10"
          >
            Browse Events
          </Link>
        </div>

        {/* Trust badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400">✓</span> No commitment required
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400">✓</span> bKash & Nagad accepted
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400">✓</span> Verified certificates
          </span>
        </div>
      </div>
    </section>
  );
}
