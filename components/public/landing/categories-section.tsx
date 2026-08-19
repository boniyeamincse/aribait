const CATEGORIES = [
  { name: "Cybersecurity", icon: "🛡️", count: 12 },
  { name: "Linux & Sysadmin", icon: "🐧", count: 8 },
  { name: "Networking", icon: "🌐", count: 6 },
  { name: "SOC & SIEM", icon: "🔍", count: 9 },
  { name: "Cloud Security", icon: "☁️", count: 5 },
  { name: "Ethical Hacking", icon: "⚡", count: 7 },
  { name: "Career & Interview", icon: "🎯", count: 4 },
  { name: "DevSecOps", icon: "🔧", count: 3 },
];

export function CategoriesSection() {
  return (
    <section className="bg-slate-900 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-violet-400">
            Categories
          </p>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Explore training by topic
          </h2>
          <p className="mt-3 text-slate-400">
            From beginner to advanced — we cover the most in-demand IT and
            security skills.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-6 text-center transition-all duration-300 hover:border-violet-500/50 hover:bg-violet-500/5 hover:shadow-lg hover:shadow-violet-500/10 cursor-pointer"
            >
              <span className="text-4xl transition-transform duration-300 group-hover:scale-110">
                {cat.icon}
              </span>
              <div>
                <p className="font-semibold text-white group-hover:text-violet-300 transition-colors">
                  {cat.name}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {cat.count} events
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
