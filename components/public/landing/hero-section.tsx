import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-28 text-slate-900">
      {/* Background glow orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-green-500/10 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/5 blur-[80px]" />
      </div>

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
          </span>
          Live sessions available now
        </div>

        {/* Heading */}
        <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
          Learn{" "}
          <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
            Cybersecurity & IT
          </span>{" "}
          from Expert Instructors
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 sm:text-xl">
          Discover, register, and join live classes, professional training
          programs, and workshops — delivered via Zoom, Google Meet, and
          Microsoft Teams.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/events"
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-green-600 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-blue-500/25 transition-all hover:from-blue-400 hover:to-green-500"
          >
            Browse All Events
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg border border-white/25 bg-transparent px-6 py-3 text-sm font-semibold text-slate-900 backdrop-blur-sm transition-all hover:bg-white/10"
          >
            Get Started Free
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
          {[
            { label: "Live Events", value: "50+" },
            { label: "Students Trained", value: "2,000+" },
            { label: "Expert Instructors", value: "15+" },
            { label: "Satisfaction Rate", value: "98%" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <span className="text-3xl font-bold text-slate-900">{stat.value}</span>
              <span className="text-sm text-slate-600">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
