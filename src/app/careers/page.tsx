import { Reveal } from "@/app/_components/motion";
import { CAREERS } from "@/lib/data";

export default function CareersPage() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
      <Reveal>
        <div className="flex items-baseline gap-4">
          <h2 className="font-display text-3xl uppercase tracking-tight text-foreground sm:text-4xl">
            Explore Career Paths
          </h2>
        </div>
      </Reveal>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CAREERS.map((career) => (
          <div
            key={career.id}
            className="rounded-2xl border border-line bg-card p-6 hover:border-accent/40 hover:shadow-xl transition-all"
          >
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-xs font-medium text-white mb-4">
              {career.icon}
            </div>
            <h3 className="font-display text-xl uppercase tracking-tight text-foreground">
              {career.title}
            </h3>
            <p className="mt-2 text-slate-400 leading-relaxed">
              {career.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {career.required_skills?.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-accent-soft text-accent"
                >
                  {skill}
                </span>
              ))}
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-400">
                Salary: {career.salary_range}
              </p>
              <p className="text-sm text-slate-400">
                Demand: {career.demand}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
