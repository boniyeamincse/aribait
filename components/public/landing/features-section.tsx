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
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-600">
            Platform Features
          </p>
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Everything you need to learn and grow
          </h2>
          <p className="mt-3 text-slate-600">
            Built specifically for the Bangladeshi IT learner — professional,
            secure, and convenient.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-blue-500/40 hover:shadow-md"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <f.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-600">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
