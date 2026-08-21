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
    <section className="relative bg-slate-50 py-24 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
      
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-indigo-600">
            Categories
          </p>
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl">
            Explore training by topic
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            From beginner to advanced — we cover the most in-demand IT and
            security skills.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.slug] ?? BookOpen;
            return (
              <Link
                key={cat.id}
                href={`/events?category=${cat.id}`}
                className="group flex flex-col items-center gap-4 rounded-3xl border border-slate-200 bg-white p-8 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/10"
              >
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-transform duration-300 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white">
                  <Icon className="h-8 w-8" strokeWidth={1.5} />
                  <div className="absolute inset-0 rounded-2xl bg-indigo-600 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-20"></div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="mt-1.5 text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full inline-block">
                    {cat.eventCount} {cat.eventCount === 1 ? "Course" : "Courses"}
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
