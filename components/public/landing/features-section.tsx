import { Video, Lock, Smartphone, CalendarDays, Award, BarChart3 } from "lucide-react";

const FEATURES = [
  {
    icon: Video,
    title: "Live Interactive Sessions",
    description:
      "Join real-time classes via Zoom, Google Meet, or Microsoft Teams. Ask questions, get answers instantly.",
  },
  {
    icon: Lock,
    title: "Secure Meeting Links",
    description:
      "Session links are protected and only accessible to confirmed, paid registrants through your dashboard.",
  },
  {
    icon: Smartphone,
    title: "bKash & Nagad Payments",
    description:
      "Pay conveniently using bKash or Nagad mobile banking — the most popular payment methods in Bangladesh.",
  },
  {
    icon: CalendarDays,
    title: "Flexible Scheduling",
    description:
      "Multi-session bootcamps with weekly classes. See the full calendar and choose programs that fit your schedule.",
  },
  {
    icon: Award,
    title: "Verified Certificates",
    description:
      "Earn QR-verified digital certificates upon course completion — shareable on LinkedIn and resumes.",
  },
  {
    icon: BarChart3,
    title: "Attendance Tracking",
    description:
      "Track your session attendance and completion progress from your personal student dashboard.",
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-white py-24 relative overflow-hidden">
      {/* Subtle top/bottom borders */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
      
      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-indigo-600">
            Platform Features
          </p>
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl">
            Everything you need to succeed
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Built specifically for the Bangladeshi IT learner — professional,
            secure, and highly convenient.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="group relative rounded-3xl border border-slate-100 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/5"
            >
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] transition-opacity group-hover:opacity-[0.08] pointer-events-none">
                <f.icon className="h-24 w-24 text-indigo-900" />
              </div>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                <f.icon className="h-6 w-6" strokeWidth={2} />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {f.title}
              </h3>
              <p className="text-base leading-relaxed text-slate-600">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
