import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BookOpenCheck,
  Bot,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CircleGauge,
  FileSearch,
  GraduationCap,
  Languages,
  LockKeyhole,
  Network,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { Reveal, ScrollProgress, Stagger, StaggerItem, TiltCard } from "./_components/motion";

export const metadata: Metadata = {
  title: "Nexvia — Career Readiness Connected to Opportunity",
  description:
    "Nexvia connects students, institutions, and employers through explainable career guidance, structured roadmaps, evidence, and opportunity workflows.",
  alternates: { canonical: "/" },
};

const careerMatches = [
  { title: "Full-Stack Software Engineer", meta: "Engineering · Strong demand", score: 94, skills: ["TypeScript", "Next.js", "PostgreSQL"], active: true },
  { title: "AI Solutions Architect", meta: "Machine learning · High growth", score: 89, skills: ["Python", "AI APIs", "Vector search"], active: false },
  { title: "Cloud Infrastructure Engineer", meta: "DevOps · Enterprise demand", score: 85, skills: ["Docker", "Kubernetes", "CI/CD"], active: false },
] as const;

const capabilities = [
  { icon: Target, title: "Explainable career matching", description: "Students see the assessment, interest, skill, and evidence signals behind every recommendation." },
  { icon: BookOpenCheck, title: "Sequential learning roadmaps", description: "Prerequisite-aware milestones turn skill gaps into a clear learning and project sequence." },
  { icon: Bot, title: "Context-aware career mentor", description: "Guidance reflects the learner’s chosen path, current milestone, and recent progress." },
  { icon: Users, title: "Mock interviews and feedback", description: "Practise role-specific questions and receive structured, actionable improvement guidance." },
  { icon: FileSearch, title: "Resume and ATS diagnostics", description: "Review role alignment, missing skills, evidence strength, and practical resume improvements." },
  { icon: ShieldCheck, title: "Evidence verification requests", description: "Portfolio claims remain self-reported until evidence is submitted and approved by a reviewer." },
] as const;

const portals = [
  {
    id: "students",
    label: "Students",
    icon: GraduationCap,
    title: "Build career readiness with visible proof",
    description: "Assess strengths, choose a direction, follow a roadmap, practise interviews, and collect evidence.",
    points: ["Explainable matches", "Personal roadmap", "Portfolio evidence", "Matched opportunities"],
    href: "/signup/student",
    action: "Start as a student",
  },
  {
    id: "colleges",
    label: "Academia",
    icon: Building2,
    title: "Turn learner progress into placement outcomes",
    description: "Understand cohort readiness, skill gaps, faculty opportunities, and employer collaboration in one view.",
    points: ["Cohort readiness", "Skill-gap visibility", "Faculty programs", "Placement tracking"],
    href: "/signup/academia",
    action: "Open institution portal",
  },
  {
    id: "recruiters",
    label: "Industry",
    icon: BriefcaseBusiness,
    title: "Find relevant talent through real evidence",
    description: "Publish opportunities, review applicants, share feedback, and collaborate with institutions.",
    points: ["Eligibility filters", "Candidate scoring", "Evidence review", "Applicant pipeline"],
    href: "/signup/industry",
    action: "Open industry workspace",
  },
] as const;

const pathway = [
  ["01", "Complete your profile", "Add interests, skills, education, and career goals."],
  ["02", "Take the assessment", "Identify strengths, preferences, and best-fit directions."],
  ["03", "Choose your direction", "Compare explained matches and select a target career."],
  ["04", "Follow your roadmap", "Complete milestones in sequence and build useful proof."],
  ["05", "Prove your readiness", "Request evidence review and act on matched opportunities."],
] as const;

const deliveryRoadmap = [
  { icon: ShieldCheck, title: "Evidence verification", status: "Live", tone: "emerald", description: "Students submit project, skill, and certificate evidence for accountable institution or recruiter review." },
  { icon: Bell, title: "Reliable notifications", status: "Live", tone: "emerald", description: "In-app and retry-safe email alerts cover matches, application updates, training, verification, and deadlines." },
  { icon: CircleGauge, title: "Impact analytics", status: "Live", tone: "emerald", description: "Placement rate, roadmap completion, readiness improvement, accepted recommendations, and verified opportunity metrics." },
  { icon: Languages, title: "Multilingual access", status: "Core live", tone: "blue", description: "Saved English, Hindi, and Marathi preferences translate the workspace navigation and establish the localization layer." },
  { icon: Network, title: "Employer upskilling", status: "Live", tone: "emerald", description: "Employee cohorts, team skill-gap reports, readiness tracking, and cohort training assignments." },
  { icon: LockKeyhole, title: "Admin moderation", status: "Live", tone: "emerald", description: "Approval queues for institutions, recruiters, jobs, FDPs, research posts, and submitted evidence." },
] as const;

const faqs = [
  ["Is Nexvia using BERT or gradient-boosting ranking today?", "No. Current matching is explainable and based on assessment, keyword, eligibility, and weighted scoring. More advanced models should only be introduced after evaluation data and monitoring are in place."],
  ["Does a portfolio item become verified when a student adds it?", "No. New evidence is self-reported. A learner may request review by attaching a public evidence URL, and only an authorized review workflow should grant verified status."],
  ["Which workflows are already available?", "Student, academia, recruiter, community, parent, verification, moderation, employer upskilling, impact analytics, multilingual navigation, and email notification workflows are available."],
  ["What is still being built?", "Advanced ML ranking remains an evidence-led research item. Current matching stays explainable until a trained model can be validated for quality, bias, monitoring, and safe fallback behavior."],
] as const;

const statusTone = {
  emerald: "border-emerald-400/20 bg-emerald-400/[.08] text-emerald-300",
  blue: "border-blue-400/20 bg-blue-400/[.08] text-blue-300",
  amber: "border-amber-400/20 bg-amber-400/[.08] text-amber-300",
  slate: "border-slate-400/15 bg-slate-400/[.06] text-slate-400",
} as const;

export default function Home() {
  return (
    <div className="nexvia-public min-h-screen overflow-hidden bg-[#070b14] text-[#e9eef7]">
      <ScrollProgress />
      <div className="nexvia-grid pointer-events-none fixed inset-0" aria-hidden="true" />

      <header className="nexvia-nav sticky top-0 z-50">
        <nav className="mx-auto flex h-[5.25rem] w-full max-w-[1536px] items-center justify-between px-5 sm:px-8 lg:px-12" aria-label="Public navigation">
          <Link href="/" className="flex items-center gap-3" aria-label="Nexvia home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#244ba9] text-xl font-medium text-[#f8fbff] shadow-[0_8px_30px_rgba(37,99,235,.22)]">X</span>
            <span className="text-xl font-bold tracking-[-.03em] text-[#f8fbff]">Nexvia</span>
          </Link>
          <div className="hidden items-center gap-8 text-sm font-semibold text-[#8e9bb1] lg:flex">
            <a href="#platform" className="transition hover:text-[#f8fbff]">Platform</a>
            <a href="#portals" className="transition hover:text-[#f8fbff]">Portals</a>
            <a href="#capabilities" className="transition hover:text-[#f8fbff]">Capabilities</a>
            <a href="#roadmap" className="transition hover:text-[#f8fbff]">Delivery roadmap</a>
            <a href="#faq" className="transition hover:text-[#f8fbff]">FAQ</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/login" className="hidden px-2 py-2 text-sm font-semibold text-[#d9e1ee] transition hover:text-[#ffffff] sm:inline-flex">Sign in</Link>
            <Link href="/demo" className="group inline-flex items-center gap-2 rounded-xl bg-[#3b82f6] px-4 py-3 text-sm font-bold text-[#ffffff] shadow-[0_8px_26px_rgba(59,130,246,.22)] transition hover:-translate-y-0.5 hover:bg-[#4b8ef7] sm:px-5">Explore demo <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></Link>
          </div>
        </nav>
      </header>

      <main className="relative z-10">
        <section id="platform" className="mx-auto grid min-h-[calc(100svh-5.25rem)] w-full max-w-[1536px] items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[.96fr_1.04fr] lg:px-12 lg:py-20">
          <div className="max-w-3xl">
            <Reveal><p className="flex items-center gap-2 text-sm font-medium text-[#78aefb]"><span className="h-1.5 w-1.5 rounded-full bg-[#3b82f6]" /> Academia–industry career infrastructure <span className="text-[#53627a]">·</span> Four connected portals</p></Reveal>
            <Reveal delay={0.08}><h1 className="mt-7 text-5xl font-bold leading-[1.03] tracking-[-.055em] text-[#f5f7fb] sm:text-6xl xl:text-[4.75rem]">From classroom learning to verified industry opportunity.</h1></Reveal>
            <Reveal delay={0.14}><p className="mt-7 max-w-2xl text-lg leading-8 text-[#93a2ba] sm:text-xl">Nexvia gives learners one accountable path from self-discovery and skill building to evidence, readiness, and relevant opportunities.</p></Reveal>
            <Reveal delay={0.18}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/demo" className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#3b82f6] px-6 py-3.5 font-bold text-[#ffffff] transition hover:-translate-y-0.5 hover:bg-[#4b8ef7]">Explore interactive demo <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></Link>
                <Link href="/signup" className="inline-flex items-center justify-center rounded-xl border border-[#22304a] bg-[#0f1727] px-6 py-3.5 font-bold text-[#f4f7fb] transition hover:border-[#3b82f6]/60 hover:bg-[#111d32]">Create student account</Link>
              </div>
            </Reveal>
            <Reveal delay={0.18}><div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#7f8da5]"><span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Explainable scores</span><span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Evidence states</span><span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Role-based workspaces</span></div></Reveal>
          </div>

          <Reveal direction="scale" delay={0.08}>
            <div className="overflow-hidden rounded-2xl border border-[#22304a] bg-[#0d1628] shadow-[0_28px_90px_rgba(0,0,0,.35)]">
              <div className="flex items-center gap-2 border-b border-[#22304a] px-5 py-4 text-sm font-semibold text-[#dce4f1]"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,.65)]" /> Nexvia career engine <span className="font-normal text-[#64748b]">· Interactive preview</span></div>
              <div className="grid grid-cols-2 border-b border-[#22304a] bg-[#09111f] p-2 sm:grid-cols-4">{["1. Career match", "2. Roadmap", "3. Readiness", "4. Placements"].map((label, index) => <span key={label} className={`rounded-lg px-3 py-3 text-center text-xs font-semibold sm:text-sm ${index === 0 ? "bg-[#3b82f6] text-[#ffffff]" : "text-[#8391a8]"}`}>{label}</span>)}</div>
              <div className="p-5 sm:p-7">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="font-bold text-[#f5f7fb]">Evaluated career alignment</h2><p className="mt-1 text-sm text-[#8391a8]">Weighted from assessment, interests, skills, and evidence</p></div><span className="text-xs text-[#65748d]">Select a path to inspect</span></div>
                <Stagger className="mt-6 space-y-3">
                  {careerMatches.map((career) => <StaggerItem key={career.title}><article className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 sm:p-5 ${career.active ? "border-[#3b82f6] bg-[#11203a]" : "border-[#202c41] bg-[#0a1220] hover:border-[#34445f]"}`}><div className="flex items-start justify-between gap-4"><div><h3 className="font-bold text-[#edf2f9]">{career.title}</h3><p className="mt-1 text-xs text-[#8290a7]">{career.meta}</p></div><div className="text-right"><p className="text-2xl font-bold text-[#f4f7fb]">{career.score}%</p><p className="text-[9px] uppercase tracking-[.12em] text-[#64748b]">relevance</p></div></div><div className="mt-4 flex flex-wrap gap-2">{career.skills.map((skill) => <span key={skill} className="rounded-md border border-[#27344a] bg-[#101a2b] px-2 py-1 text-[11px] text-[#b5c0d1]">{skill}</span>)}</div></article></StaggerItem>)}
                </Stagger>
                <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-[#68778f]"><Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#60a5fa]" /> Current recommendations use transparent weighted scoring—not a claim of BERT or gradient-boosting infrastructure.</p>
              </div>
            </div>
          </Reveal>
        </section>

        <section id="capabilities" className="border-y border-[#18243a] bg-[#09101d]/80">
          <div className="mx-auto w-full max-w-[1536px] px-5 py-24 sm:px-8 lg:px-12">
            <Reveal><p className="text-xs font-bold uppercase tracking-[.16em] text-[#4c8ff8]">Core capabilities</p><h2 className="mt-4 text-3xl font-bold tracking-[-.04em] text-[#f4f7fb] sm:text-5xl">Built for accountable career growth</h2><p className="mt-4 max-w-3xl text-lg leading-8 text-[#8d9bb2]">Each workflow connects to the next, so progress becomes clearer to the learner, institution, and employer.</p></Reveal>
            <Stagger className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{capabilities.map(({ icon: Icon, title, description }) => <StaggerItem key={title}><TiltCard className="h-full rounded-2xl border border-[#22304a] bg-[#10192b] p-7 transition hover:border-[#3b82f6]/60 hover:bg-[#111d31]"><Icon className="h-6 w-6 text-[#3b82f6]" /><h3 className="mt-7 text-lg font-bold text-[#f0f4fa]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#91a0b8]">{description}</p></TiltCard></StaggerItem>)}</Stagger>
          </div>
        </section>

        <section id="portals" className="mx-auto w-full max-w-[1536px] px-5 py-24 sm:px-8 lg:px-12">
          <Reveal><p className="text-xs font-bold uppercase tracking-[.16em] text-[#4c8ff8]">Connected ecosystem</p><h2 className="mt-4 text-3xl font-bold tracking-[-.04em] text-[#f4f7fb] sm:text-5xl">Dedicated workspaces for every role</h2><p className="mt-4 text-lg text-[#8d9bb2]">Purpose-built views, permissions, and actions—on one shared career-readiness system.</p></Reveal>
          <Stagger className="mt-12 grid gap-6 lg:grid-cols-3">{portals.map(({ id, label, icon: Icon, title, description, points, href, action }) => <StaggerItem key={id}><article id={id} className="flex h-full scroll-mt-28 flex-col rounded-2xl border border-[#22304a] bg-[#10192b] p-7 sm:p-8"><div className="flex items-center justify-between"><span className="text-sm font-bold text-[#3b82f6]">{label}</span><Icon className="h-6 w-6 text-[#8fa0b9]" /></div><h3 className="mt-7 text-2xl font-bold leading-8 text-[#f4f7fb]">{title}</h3><p className="mt-4 leading-7 text-[#91a0b8]">{description}</p><ul className="mt-8 space-y-3 border-t border-[#263249] pt-7 text-sm text-[#d3dbe7]">{points.map((point) => <li key={point} className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-[#3b82f6]" /> {point}</li>)}</ul><Link href={href} className="group mt-10 inline-flex items-center justify-center gap-2 rounded-xl border border-[#2b3951] bg-[#121d30] px-4 py-3 text-sm font-bold text-[#f4f7fb] transition hover:border-[#3b82f6] hover:bg-[#15243c]">{action} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></Link></article></StaggerItem>)}</Stagger>
        </section>

        <section className="border-y border-[#18243a] bg-[#080f1b]">
          <div className="mx-auto grid w-full max-w-[1536px] gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[.72fr_1.28fr] lg:px-12">
            <Reveal><div className="lg:sticky lg:top-32"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#4c8ff8]">Your Nexvia pathway</p><h2 className="mt-4 text-3xl font-bold tracking-[-.04em] text-[#f4f7fb] sm:text-5xl">One direction.<br />Five accountable steps.</h2><p className="mt-5 max-w-xl text-lg leading-8 text-[#8d9bb2]">Each completed stage produces a useful output that improves what the learner should do next.</p><Link href="/demo" className="mt-7 inline-flex items-center gap-2 font-bold text-[#70a9fa] hover:text-[#9fc3fb]">Walk through the full journey <ArrowRight className="h-4 w-4" /></Link></div></Reveal>
            <div className="relative space-y-6 before:absolute before:bottom-10 before:left-7 before:top-10 before:w-px before:bg-gradient-to-b before:from-[#3b82f6] before:via-[#254d94] before:to-transparent">{pathway.map(([number, title, description], index) => <Reveal key={number} direction={index % 2 ? "right" : "left"} delay={index * 0.03}><article className={`relative grid gap-5 rounded-2xl border border-[#22304a] bg-[#10192b] p-6 sm:ml-14 sm:grid-cols-[auto_1fr] sm:p-7 ${index % 2 ? "lg:ml-28" : "lg:mr-28"}`}><span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-xl border border-[#2e65bb] bg-[#11233f] text-lg font-bold text-[#61a0fb]">{number}</span><div><h3 className="text-xl font-bold text-[#f1f5fa]">{title}</h3><p className="mt-2 leading-7 text-[#91a0b8]">{description}</p></div></article></Reveal>)}</div>
          </div>
        </section>

        <section id="roadmap" className="mx-auto w-full max-w-[1536px] px-5 py-24 sm:px-8 lg:px-12">
          <Reveal><div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#4c8ff8]">Honest delivery roadmap</p><h2 className="mt-4 max-w-4xl text-3xl font-bold tracking-[-.04em] text-[#f4f7fb] sm:text-5xl">What is live, what is partial, and what comes next</h2></div><p className="max-w-xl text-sm leading-6 text-[#8290a7]">Nexvia separates product evidence from roadmap ambition. A planned capability is never presented as a live one.</p></div></Reveal>
          <Stagger className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{deliveryRoadmap.map(({ icon: Icon, title, status, tone, description }) => <StaggerItem key={title}><article className="h-full rounded-2xl border border-[#22304a] bg-[#0d1626] p-6 transition hover:-translate-y-1 hover:border-[#344a6c]"><div className="flex items-center justify-between gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#14213a] text-[#68a4fb]"><Icon className="h-5 w-5" /></span><span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] ${statusTone[tone]}`}>{status}</span></div><h3 className="mt-6 text-lg font-bold text-[#f1f4f9]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#8d9bb2]">{description}</p></article></StaggerItem>)}</Stagger>
        </section>

        <section className="border-y border-[#1c2b43] bg-[#0b1423]">
          <div className="mx-auto grid w-full max-w-[1536px] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:px-12"><Reveal><p className="text-xs font-bold uppercase tracking-[.16em] text-[#4c8ff8]">Built for real evaluation</p><h2 className="mt-4 max-w-4xl text-3xl font-bold tracking-[-.04em] text-[#f4f7fb] sm:text-5xl">Explore the complete student journey without an account.</h2><p className="mt-4 max-w-2xl text-lg leading-8 text-[#8d9bb2]">See assessment, career matches, roadmaps, readiness, interview practice, evidence, and opportunities in context.</p></Reveal><Reveal direction="right"><Link href="/demo" className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#f4f7fb] px-6 py-4 font-bold text-[#07101e] transition hover:-translate-y-0.5 hover:bg-[#dce9fb]">Continue as demo student <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></Link></Reveal></div>
        </section>

        <section id="faq" className="mx-auto w-full max-w-5xl px-5 py-24 sm:px-8">
          <Reveal><p className="text-center text-xs font-bold uppercase tracking-[.16em] text-[#4c8ff8]">Clear answers</p><h2 className="mt-4 text-center text-3xl font-bold tracking-[-.04em] text-[#f4f7fb] sm:text-5xl">What the platform does today</h2></Reveal>
          <div className="mt-12 space-y-3">{faqs.map(([question, answer]) => <Reveal key={question}><details className="group rounded-2xl border border-[#22304a] bg-[#0d1626] p-5 open:border-[#31558c]"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-bold text-[#edf2f8] marker:hidden">{question}<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#2b3b55] text-[#6ea7f8] transition group-open:rotate-45">+</span></summary><p className="mt-4 max-w-3xl text-sm leading-7 text-[#8d9bb2]">{answer}</p></details></Reveal>)}</div>
        </section>
      </main>
    </div>
  );
}
