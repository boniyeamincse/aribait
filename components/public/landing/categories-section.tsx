import Link from "next/link";
import {
  ShieldCheck,
  Terminal,
  Zap,
  Radar,
  Cloud,
  BrainCircuit,
  Code2,
  Briefcase,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

import { listCategoriesForLanding } from "@/lib/events/queries";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  cybersecurity: ShieldCheck,
  "linux-system-administration": Terminal,
  "ethical-hacking": Zap,
  "soc-analyst": Radar,
  "cloud-computing-devops": Cloud,
  "data-science-artificial-intelligence": BrainCircuit,
  "web-development": Code2,
  "software-development": Code2,
  "career-development-professional-skills": Briefcase,
};

export async function CategoriesSection() {
  const categories = await listCategoriesForLanding(8);

  if (categories.length === 0) return null;

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-emerald-600">
            Categories
          </p>
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Explore training by topic
          </h2>
          <p className="mt-3 text-slate-600">
            From beginner to advanced — we cover the most in-demand IT and
            security skills.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.slug] ?? BookOpen;
            return (
              <Link
                key={cat.id}
                href={`/events?category=${cat.id}`}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-6 text-center transition-all duration-300 hover:border-emerald-500/50 hover:bg-emerald-50 hover:shadow-lg hover:shadow-emerald-500/10"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {cat.name}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {cat.eventCount} event{cat.eventCount === 1 ? "" : "s"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
