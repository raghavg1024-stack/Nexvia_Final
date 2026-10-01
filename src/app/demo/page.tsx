import Link from "next/link";
import {
  ArrowRight,
  Brain,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Map,
  Mic2,
  Sparkles,
  Target,
} from "lucide-react";
import { DemoJourneyAnimation } from "./demo-journey";

const matchFactors = [
  { label: "Interests", value: 92 },
  { label: "Current skills", value: 84 },
  { label: "Work style", value: 88 },
  { label: "Career goal", value: 90 },
];

const roadmap = [
  ["Foundation sprint", "JavaScript, Git and problem solving", "2 weeks"],
  ["Build evidence", "Create a responsive React product", "4 weeks"],
  ["Industry readiness", "Testing, APIs and deployment", "3 weeks"],
  ["Opportunity launch", "Resume, interview and applications", "2 weeks"],
];

const demoSteps = ["Profile signals", "Strengths & gaps", "Career match", "Roadmap", "Practice", "Opportunity"] as const;

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-[#070a12] px-4 py-8 text-slate-200 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/" className="text-sm font-bold text-violet-300">Nexvia</Link>
            <h1 className="mt-2 font-display text-3xl uppercase tracking-tight text-white sm:text-4xl">Judge demonstration mode</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">A public, read-only journey showing how one student moves from profile signals to career evidence and opportunities—no login required.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-200"><Clock3 className="h-4 w-4" /> 3-minute walkthrough</div>
        </header>

        <nav aria-label="Demo journey" className="mt-6 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">{demoSteps.map((step, index) => <a key={step} href={`#demo-step-${index + 1}`} className="rounded-xl border border-white/10 bg-white/[.03] p-3 text-xs text-slate-300 transition hover:border-violet-400/40 hover:text-white"><span className="mr-2 font-bold text-violet-300">{index + 1}</span>{step}</a>)}</nav>
        <DemoJourneyAnimation />

        <section id="demo-step-1" className="mt-8 grid scroll-mt-24 gap-5 lg:grid-cols-[.78fr_1.22fr]">
          <article className="rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-400/15 to-card p-6">
            <div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500 text-white"><GraduationCap className="h-6 w-6" /></span><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-300">Sample learner</p><h2 className="text-xl font-bold text-white">Aarav · 2nd-year student</h2></div></div>
            <dl className="mt-6 space-y-4 text-sm">
              <div><dt className="text-slate-500">Goal</dt><dd className="mt-1 text-slate-200">Become job-ready through practical projects</dd></div>
              <div><dt className="text-slate-500">Strengths</dt><dd className="mt-1 text-slate-200">Problem solving, programming, teamwork</dd></div>
              <div><dt className="text-slate-500">Learning preference</dt><dd className="mt-1 text-slate-200">Hands-on · 10 hours per week</dd></div>
            </dl>
          </article>

          <article id="demo-step-2" className="scroll-mt-24 rounded-3xl border border-cyan-400/20 bg-card p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Top recommendation</p><h2 className="mt-2 font-display text-2xl uppercase text-white">Frontend Developer</h2><p className="mt-2 text-sm text-slate-400">Top-3 relevance is shown as guidance, not a guaranteed career outcome.</p></div><div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-8 border-cyan-400/30 bg-background text-xl font-black text-white">89%</div></div>
            <details className="mt-5 rounded-xl border border-cyan-400/15 bg-cyan-400/[.04] p-4 text-sm"><summary className="cursor-pointer font-semibold text-cyan-200">How is the 89% score calculated?</summary><p className="mt-3 leading-6 text-slate-400">The demonstration combines interests, current skill evidence, learning preference, career goals and project history. It represents match relevance, not guaranteed success or model accuracy.</p></details>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {matchFactors.map((factor) => <div key={factor.label}><div className="flex justify-between text-xs"><span className="text-slate-400">{factor.label}</span><span className="font-semibold text-white">{factor.value}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" style={{ width: `${factor.value}%` }} /></div></div>)}
            </div>
          </article>
        </section>

        <section id="demo-step-3" className="mt-5 scroll-mt-24 rounded-3xl border border-white/10 bg-card p-6">
          <p className="mb-4 text-xs font-bold uppercase tracking-[.16em] text-cyan-300">Step 3 · Career recommendation accepted</p>
          <div className="flex items-center gap-3"><Map className="h-6 w-6 text-violet-300" /><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Personalized execution plan</p><h2 className="mt-1 text-xl font-bold text-white">11-week roadmap</h2></div></div>
          <div className="mt-6 grid gap-3 md:grid-cols-4">{roadmap.map(([title, detail, time], index) => <article key={title} className="relative rounded-2xl border border-line bg-background p-5"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-200">{index + 1}</span><h3 className="mt-4 font-semibold text-white">{title}</h3><p className="mt-2 text-xs leading-5 text-slate-400">{detail}</p><p className="mt-4 text-xs font-bold text-cyan-300">{time}</p></article>)}</div>
        </section>

        <section id="demo-step-4" className="mt-5 grid scroll-mt-24 gap-5 md:grid-cols-3">
          {[{ icon: Brain, step: "Step 4", title: "AI Mentor", text: "Explains the next action using the learner’s selected career, skill gaps and progress." }, { icon: Mic2, step: "Step 5", title: "Mock Interview", text: "Scores structured answers consistently, then uses Gemini for specific coaching." }, { icon: BriefcaseBusiness, step: "Step 6", title: "Opportunity Match", text: "Connects the roadmap to relevant jobs and shows nearby alternatives when exact matches are unavailable." }].map(({ icon: Icon, step, title, text }) => <article id={step === "Step 5" ? "demo-step-5" : step === "Step 6" ? "demo-step-6" : undefined} key={title} className="scroll-mt-24 rounded-2xl border border-line bg-card p-5"><p className="text-xs font-bold uppercase tracking-[.16em] text-violet-300">{step}</p><Icon className="mt-4 h-5 w-5 text-cyan-300" /><h2 className="mt-4 font-bold text-white">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{text}</p></article>)}
        </section>

        <section className="mt-5 rounded-3xl border border-emerald-400/20 bg-emerald-400/5 p-6 sm:p-8">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center"><div><div className="flex items-center gap-2 text-emerald-300"><CheckCircle2 className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-[0.16em]">Final · Readiness improves</span></div><h2 className="mt-3 font-display text-2xl uppercase text-white">From uncertain to application-ready</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">The system tracks roadmap completion, skill evidence, interview improvement and application activity. Pilot validation is still required before claiming a final accuracy percentage.</p></div><div className="flex flex-col gap-2"><Link href="/signup/student" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-100">Try this journey <ArrowRight className="h-4 w-4" /></Link><Link href="/waitlist" className="text-center text-xs font-semibold text-cyan-300">Join pilot waitlist</Link></div></div>
        </section>

        <section className="mt-5 flex flex-col gap-4 rounded-3xl border border-violet-400/20 bg-gradient-to-r from-violet-500/15 to-cyan-500/10 p-6 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><Target className="mt-1 h-5 w-5 text-violet-300" /><div><h2 className="font-bold text-white">The innovation</h2><p className="mt-1 max-w-3xl text-sm leading-6 text-slate-300">Nexvia closes the feedback loop: assessment evidence changes the recommendation, the recommendation creates a roadmap, progress updates readiness, and readiness connects the learner to opportunities.</p></div></div><Sparkles className="hidden h-8 w-8 shrink-0 text-cyan-300 sm:block" /></section>
      </div>
    </main>
  );
}
