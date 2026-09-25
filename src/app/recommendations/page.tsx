import { redirect } from "next/navigation";
import { CAREERS, skillsAreRelated } from "@/lib/data";
import type { AssessmentResponse, Career, CareerRecommendation } from "@/lib/types";
import { getAssessment, selectCareer } from "@/lib/assessment";
import { Reveal, Stagger, StaggerItem } from "../_components/motion";

export const dynamic = "force-dynamic";

function MatchRing({ percentage }: { percentage: number }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c - (percentage / 100) * c;
  return (
    <div className="relative flex h-20 w-20 items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="var(--line)"
          strokeWidth="5"
        />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="text-center">
        <p className="font-display text-lg text-foreground">{percentage}%</p>
      </div>
    </div>
  );
}

function matchFactors(career: Career, responses: AssessmentResponse[]) {
  const answer = (id: string) => responses.find((item) => item.question_id === id)?.answer;
  const rating = (id: string) => typeof answer(id) === "number" ? Number(answer(id)) : 3;
  const skills = Array.isArray(answer("skills_2")) ? answer("skills_2") as string[] : [];
  const personality = String(answer("personality_1") ?? "");
  const goal = String(answer("goals_1") ?? "");
  const interests = { analytical: rating("interest_1"), creative: rating("interest_2"), helping: rating("interest_3") };
  const categoryInterests: Record<string, Array<keyof typeof interests>> = {
    Technology: ["analytical", "creative"], Finance: ["analytical"], Design: ["creative", "helping"], Media: ["creative", "helping"], Communication: ["creative", "helping"], Business: ["analytical", "creative"], Healthcare: ["helping", "analytical"], Hospitality: ["creative", "helping"], "Social Services": ["helping"],
  };
  const personalityCategories: Record<string, string[]> = {
    "Lead and organize": ["Business", "Healthcare", "Hospitality"],
    "Analyze and plan": ["Technology", "Finance", "Business"],
    "Create and brainstorm": ["Design", "Media", "Communication", "Technology"],
    "Support and execute": ["Healthcare", "Social Services", "Hospitality"],
  };
  const relevant = categoryInterests[career.category] ?? ["analytical"];
  const interestScore = Math.round(relevant.reduce((sum, key) => sum + interests[key], 0) / relevant.length / 5 * 100);
  const matchingSkills = career.required_skills.filter((required) => skills.some((selected) => skillsAreRelated(selected, required)));
  const skillScore = career.required_skills.length ? Math.round(matchingSkills.length / career.required_skills.length * 100) : 50;
  const workStyleScore = (personalityCategories[personality] ?? []).includes(career.category) ? 90 : 55;
  const goalMatches = goal === "Build my own business"
    ? ["Entrepreneur / Startup Founder", "Product Manager", "Digital Marketer", "Marketing Manager", "Sales Manager"].includes(career.title)
    : goal === "Learn a new skill"
      ? ["Technology", "Design", "Media"].includes(career.category)
      : goal === "Advance my career" && career.title.includes("Manager");

  return [
    { label: "Interest signal", value: interestScore },
    { label: "Current skill coverage", value: skillScore },
    { label: "Work-style alignment", value: workStyleScore },
    { label: "Goal alignment", value: goalMatches ? 92 : 60 },
  ];
}

export default async function RecommendationsPage() {
  const { assessment, analysisReport, recommendations } = await getAssessment();

  if (!analysisReport || recommendations.length === 0) {
    redirect("/assessment");
  }

  const matches = recommendations
    .map((rec) => ({ rec, career: CAREERS.find((c) => c.id === rec.career_id) }))
    .filter((m): m is { rec: CareerRecommendation; career: Career } => Boolean(m.career));
  const topScore = matches[0]?.rec.match_percentage ?? 0;
  const secondScore = matches[1]?.rec.match_percentage ?? topScore;
  const scoreGap = topScore - secondScore;
  const confidence = topScore >= 82 && scoreGap >= 5
    ? { label: "High confidence", detail: "Your answers show a clear leading direction." }
    : topScore >= 68
      ? { label: "Moderate confidence", detail: "Two or more paths fit you; compare them before choosing." }
      : { label: "Exploratory result", detail: "Try small projects in these fields and retake the assessment after learning more." };

  return (
    <main className="min-h-screen bg-background px-6 py-12 text-slate-300">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <header>
            <p className="font-display text-sm uppercase tracking-widest text-accent">
              Career matches
            </p>
            <h1 className="mt-2 font-display text-3xl uppercase tracking-tight text-foreground">
              Your top career paths
            </h1>
            <p className="mt-3 text-slate-400">
              Based on your assessment, these careers fit your skills, interests, and goals.
            </p>
          </header>
          <div className="mt-6 rounded-2xl border border-accent/30 bg-accent-soft p-4">
            <p className="text-sm font-semibold text-accent">{confidence.label}</p>
            <p className="mt-1 text-sm text-slate-300">{confidence.detail}</p>
            <p className="mt-2 text-xs text-slate-500">
              Matches are explainable guidance based on your answers, not a guarantee or final career decision.
            </p>
          </div>
        </Reveal>

        <Stagger className="mt-10 grid gap-6 md:grid-cols-2">
          {matches.map(({ rec, career }) => {
            const factors = matchFactors(career, assessment?.responses ?? []);
            return (
            <StaggerItem key={rec.id}>
              <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-card transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl hover:shadow-slate-200">
                {/* Top accent bar */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-violet-500 to-accent opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-line bg-slate-800 text-2xl">
                        {career.icon}
                      </div>
                      <div>
                        <h2 className="font-display text-xl uppercase tracking-tight text-foreground">
                          {career.title}
                        </h2>
                        <p className="text-sm text-slate-400">{career.category}</p>
                      </div>
                    </div>
                    <MatchRing percentage={rec.match_percentage} />
                  </div>

                  <div className="mt-5 rounded-xl border border-line bg-background/60 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Match evidence</h3>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500">From your answers</span>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {factors.map((factor) => (
                        <div key={factor.label}>
                          <div className="flex justify-between gap-3 text-xs"><span className="text-slate-400">{factor.label}</span><span className="font-semibold text-foreground">{factor.value}%</span></div>
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" style={{ width: `${factor.value}%` }} /></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="prose prose-invert prose-sm mt-4 max-w-none text-slate-400">
                    {career.description}
                  </p>

                  {/* Why it matches */}
                  <div className="mt-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Why it matches
                    </h3>
                    <ul className="mt-2 space-y-1.5 text-sm text-slate-300">
                      {rec.reasons.length > 0 ? (
                        rec.reasons.map((reason) => (
                          <li key={reason} className="flex items-start gap-2">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                            {reason}
                          </li>
                        ))
                      ) : (
                        <li>Strong fit based on your overall profile.</li>
                      )}
                    </ul>
                  </div>

                  {/* Skills */}
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Skills to build
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {rec.required_skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-line bg-slate-800 px-2.5 py-1 text-xs text-slate-400"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        You already bring
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {rec.existing_strengths.length > 0 ? (
                          rec.existing_strengths.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full border border-accent/40 bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="rounded-full border border-line bg-slate-800 px-2.5 py-1 text-xs text-slate-400">
                            Fresh start — plenty to learn
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Salary + demand */}
                  <div className="mt-5 flex items-center gap-4 text-sm">
                    <span className="text-slate-400">
                      💰 {career.salary_range}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        career.demand === "very_high"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : career.demand === "high"
                            ? "bg-blue-500/10 text-blue-500"
                            : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {career.demand.replace("_", " ")} demand
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <div className="border-t border-line p-4">
                  <form action={selectCareer.bind(null, career.id, rec.id)}>
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:brightness-110"
                    >
                      Choose this career →
                    </button>
                  </form>
                </div>
              </article>
            </StaggerItem>
          );})}
        </Stagger>
      </div>
    </main>
  );
}
