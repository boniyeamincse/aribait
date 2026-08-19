const FEATURES = [
  {
    icon: "🔴",
    title: "Live Interactive Sessions",
    description:
      "Join real-time classes via Zoom, Google Meet, or Microsoft Teams. Ask questions, get answers instantly.",
  },
  {
    icon: "🔐",
    title: "Secure Meeting Links",
    description:
      "Session links are protected and only accessible to confirmed, paid registrants through your dashboard.",
  },
  {
    icon: "📱",
    title: "bKash & Nagad Payments",
    description:
      "Pay conveniently using bKash or Nagad mobile banking — the most popular payment methods in Bangladesh.",
  },
  {
    icon: "📅",
    title: "Flexible Scheduling",
    description:
      "Multi-session bootcamps with weekly classes. See the full calendar and choose programs that fit your schedule.",
  },
  {
    icon: "🏆",
    title: "Verified Certificates",
    description:
      "Earn QR-verified digital certificates upon course completion — shareable on LinkedIn and resumes.",
  },
  {
    icon: "📊",
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
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-400">
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
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-blue-500/30 hover:bg-white/80"
            >
              <div className="mb-4 text-4xl">{f.icon}</div>
              <h3 className="mb-2 text-lg font-bold text-slate-900 group-hover:text-blue-300 transition-colors">
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
