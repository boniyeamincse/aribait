import Link from "next/link";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-violet-950/30 to-slate-950 py-24">
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
          🚀 Start your IT career today
        </div>
        <h2 className="text-4xl font-bold text-white sm:text-5xl">
          Ready to level up your{" "}
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            IT skills?
          </span>
        </h2>
        <p className="mt-5 text-lg text-slate-400">
          Join thousands of Bangladeshi professionals who are building their
          cybersecurity and IT careers with live expert-led training.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-cyan-500"
          >
            Create Free Account
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center justify-center rounded-lg border border-white/25 bg-transparent px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
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
