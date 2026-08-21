import Link from "next/link";
import { Search } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white pt-24 pb-32 lg:pt-32 lg:pb-40">
      {/* Background glow orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-20 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute -right-20 bottom-0 h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-8 items-center">
          
          {/* Left Column: Content */}
          <div className="max-w-2xl lg:max-w-none">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-50/50 px-4 py-1.5 text-sm font-medium text-indigo-700 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
              </span>
              Registration open for new batches
            </div>

            {/* Heading */}
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-[4rem] leading-tight">
              Master <br />
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-500 bg-clip-text text-transparent">
                Cybersecurity & IT
              </span>
            </h1>

            <p className="mt-6 text-lg text-slate-600 sm:text-xl leading-relaxed max-w-lg">
              Empower your future with industry-leading tech training, certification programs, and expert-led live classes.
            </p>

            {/* Search/CTA Box */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 max-w-md">
              <Link
                href="/events"
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-700 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0"
              >
                Explore Courses
              </Link>
              <Link
                href="/register"
                className="inline-flex flex-1 items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-900 transition-all hover:border-slate-300 hover:bg-slate-50"
              >
                Join for Free
              </Link>
            </div>

            {/* Trust Section */}
            <div className="mt-14 flex flex-col sm:flex-row sm:items-center gap-6 border-t border-slate-100 pt-8">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-slate-900">Joined by 15,000+ Students</p>
                <div className="flex -space-x-2 overflow-hidden mt-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-slate-200" style={{ backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 10})`, backgroundSize: 'cover' }} />
                  ))}
                </div>
              </div>
              
              <div className="hidden sm:block h-12 w-px bg-slate-200"></div>
              
              <div className="flex flex-col gap-1">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm font-bold text-slate-900">4.9/5 <span className="font-medium text-slate-500">Rating</span></p>
                <p className="text-xs text-slate-500">Based on 12,000+ Reviews</p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Mockup */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square">
              {/* Decorative grid background inside the visual area */}
              <div className="absolute inset-0 rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden shadow-2xl shadow-indigo-500/10">
                <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: "linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
                
                {/* Floating Elements / Glass Cards */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl flex flex-col p-6 z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 16 2 2 4-4"/></svg>
                    </div>
                    <div>
                      <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
                      <div className="h-3 w-16 bg-slate-100 rounded mt-2"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mt-auto">
                    <div className="h-2 w-full bg-slate-100 rounded"></div>
                    <div className="h-2 w-5/6 bg-slate-100 rounded"></div>
                    <div className="h-2 w-4/6 bg-slate-100 rounded"></div>
                  </div>
                </div>

                {/* Floating Badge 1 */}
                <div className="absolute top-1/4 -right-4 w-32 h-auto bg-white rounded-xl shadow-lg border border-slate-100 p-3 z-20 animate-[bounce_4s_infinite]">
                  <div className="flex gap-2 items-center">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span className="text-xs font-bold text-slate-700">Certified</span>
                  </div>
                </div>

                {/* Floating Badge 2 */}
                <div className="absolute bottom-1/4 -left-6 w-36 h-auto bg-white rounded-xl shadow-lg border border-slate-100 p-3 z-20 animate-[bounce_5s_infinite_reverse]">
                  <div className="flex gap-2 items-center">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-xs">&lt;/&gt;</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400">Live Code</span>
                      <span className="text-xs font-bold text-slate-700">Practice</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
