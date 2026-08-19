const TESTIMONIALS = [
  {
    name: "Rahim Uddin",
    role: "SOC Analyst, Dhaka",
    avatar: "RU",
    rating: 5,
    text: "The SOC Bootcamp was exactly what I needed to land my first cybersecurity job. The live sessions were practical and the instructor was incredibly supportive.",
    color: "from-blue-500 to-blue-600",
  },
  {
    name: "Fatema Begum",
    role: "System Admin, Chittagong",
    avatar: "FB",
    rating: 5,
    text: "Ariba IT's Linux bootcamp helped me go from zero to confidently managing production servers. The hands-on approach is unmatched.",
    color: "from-green-500 to-purple-600",
  },
  {
    name: "Kamal Hossain",
    role: "Network Engineer, Sylhet",
    avatar: "KH",
    rating: 5,
    text: "Best IT training platform in Bangladesh. The bKash payment is convenient and the Zoom sessions are well-structured. Highly recommended!",
    color: "from-emerald-500 to-teal-600",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="text-yellow-400 text-sm">
          ★
        </span>
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-emerald-400">
            Testimonials
          </p>
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            What our students say
          </h2>
          <p className="mt-3 text-slate-600">
            Join 2,000+ professionals who have upskilled with Ariba IT.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-all duration-300 hover:border-slate-300 hover:shadow-xl hover:shadow-black/30"
            >
              <StarRating count={t.rating} />
              <p className="flex-1 text-sm leading-relaxed text-slate-700">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3 border-t border-slate-200 pt-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-sm font-bold text-slate-900`}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
