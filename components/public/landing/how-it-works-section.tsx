const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Find Your Event",
    description:
      "Browse live classes, training programs, workshops, and webinars. Filter by category, date, or price.",
    icon: "🔍",
    color: "from-blue-500 to-blue-600",
  },
  {
    step: "02",
    title: "Register & Pay Securely",
    description:
      "Instantly register for free events or complete a simple bKash/Nagad payment for paid programs.",
    icon: "✅",
    color: "from-green-500 to-green-600",
  },
  {
    step: "03",
    title: "Join Your Live Session",
    description:
      "Receive reminders and securely join via Zoom, Google Meet, or Microsoft Teams from your dashboard.",
    icon: "🎯",
    color: "from-blue-500 to-blue-600",
  },
  {
    step: "04",
    title: "Earn Your Certificate",
    description:
      "Complete the program, meet attendance requirements, and download your verified certificate.",
    icon: "🏆",
    color: "from-emerald-500 to-emerald-600",
  },
];

export function HowItWorksSection() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-400">
            How It Works
          </p>
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            From registration to certificate
          </h2>
          <p className="mt-3 text-slate-600">
            A simple, seamless experience designed for Bangladeshi learners.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((item, idx) => (
            <div key={item.step} className="relative flex flex-col items-center text-center">
              {/* Connector line */}
              {idx < HOW_IT_WORKS.length - 1 && (
                <div className="absolute left-[calc(50%+3rem)] top-8 hidden h-0.5 w-[calc(100%-6rem)] bg-gradient-to-r from-slate-700 to-slate-800 lg:block" />
              )}

              {/* Icon */}
              <div
                className={`relative z-10 mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-3xl shadow-lg`}
              >
                {item.icon}
              </div>

              {/* Step number */}
              <span className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-600">
                Step {item.step}
              </span>

              <h3 className="mb-2 text-lg font-bold text-slate-900">{item.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
