import Link from "next/link";
import { Rocket, Check } from "lucide-react";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden py-24 bg-slate-900 mt-10">
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/20 blur-[120px]" />
        <div className="absolute right-0 bottom-0 h-[300px] w-[400px] rounded-full bg-emerald-500/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-5 py-2 text-sm font-medium text-indigo-200 backdrop-blur-md">
          <Rocket className="h-4 w-4 text-emerald-400" strokeWidth={2} /> Start your IT career today
        </div>
        <h2 className="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl tracking-tight">
          Ready to level up your{" "}
          <span className="bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">
            IT skills?
          </span>
        </h2>
        <p className="mt-6 text-xl text-slate-300 max-w-2xl mx-auto">
          Join thousands of Bangladeshi professionals who are building their
          cybersecurity and IT careers with live expert-led training.
        </p>
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-400 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
          >
            Create Free Account
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm px-8 py-4 text-base font-bold text-white transition-all hover:bg-slate-700 hover:border-slate-600"
          >
            Browse Events
          </Link>
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm font-medium text-slate-400">
          <span className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
              <Check className="h-4 w-4 text-emerald-400" strokeWidth={3} />
            </div>
            No commitment required
          </span>
          <span className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
              <Check className="h-4 w-4 text-emerald-400" strokeWidth={3} />
            </div>
            bKash & Nagad accepted
          </span>
          <span className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
              <Check className="h-4 w-4 text-emerald-400" strokeWidth={3} />
            </div>
            Verified certificates
          </span>
        </div>
      </div>
    </section>
  );
}
