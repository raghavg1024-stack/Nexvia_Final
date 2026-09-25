import type { Metadata } from "next";
import Link from "next/link";
import { Check, Circle, LockKeyhole, Sparkles } from "lucide-react";
import { getRoadmap, ensureMilestones } from "@/lib/roadmap";
import { CAREERS } from "@/lib/data";
import type { Milestone, MilestoneStatus } from "@/lib/types";
import { Reveal } from "../_components/motion";
import { CourseToggle, MilestoneAction } from "./status-toggle";
import { CareerSwitcher } from "./career-switcher";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Roadmap",
};

function statusBadge(status: MilestoneStatus) {
  switch (status) {
    case "locked":
      return (
        <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-slate-400">
          <LockKeyhole className="h-3 w-3" aria-hidden="true" /> Locked
        </span>
      );
    case "in_progress":
      return (
        <span className="rounded-full border border-violet-400/25 bg-violet-400/10 px-2.5 py-1 text-xs font-semibold text-violet-200">
          In progress
        </span>
      );
    case "completed":
      return (
        <span className="flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
          <Check className="h-3 w-3" aria-hidden="true" /> Completed
        </span>
      );
  }
}

function statusDot(status: MilestoneStatus) {
  switch (status) {
    case "locked":
      return "border-slate-600 bg-[#0c101c] text-slate-500";
    case "in_progress":
      return "border-violet-300 bg-violet-500 text-white shadow-[0_0_28px_rgba(139,124,255,.62)]";
    case "completed":
      return "border-emerald-300 bg-emerald-400/15 text-emerald-300 shadow-[0_0_24px_rgba(52,211,153,.3)]";
  }
}

function milestoneIcon(status: MilestoneStatus) {
  if (status === "completed") return <Check className="h-5 w-5" aria-hidden="true" />;
  if (status === "in_progress") return <Circle className="h-3.5 w-3.5 fill-current" aria-hidden="true" />;
  return <LockKeyhole className="h-4 w-4" aria-hidden="true" />;
}

function MilestoneCard({
  milestone,
  index,
  total,
  milestoneAvailable,
}: {
  milestone: Milestone;
  index: number;
  total: number;
  milestoneAvailable: boolean;
}) {
  const completedCourses = milestone.courses.filter(
    (course) => course.status === "completed"
  ).length;
  const totalCourses = milestone.courses.length;
  const progress =
    totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;
  const canComplete = totalCourses > 0 && completedCourses === totalCourses;
  const nextCourseIndex = milestone.courses.findIndex(
    (course) => course.status !== "completed"
  );
  const isRight = index % 2 === 0;

  return (
    <li className={`roadmap-step ${isRight ? "roadmap-step-right" : "roadmap-step-left"}`}>
      <div className="roadmap-connector" aria-hidden="true" />
      <div className={`roadmap-marker ${statusDot(milestone.status)}`}>
        {milestoneIcon(milestone.status)}
        <span className="sr-only">Milestone {index + 1}</span>
      </div>

      <Reveal
        className="roadmap-card-wrap"
        direction={isRight ? "right" : "left"}
        delay={Math.min(index * 0.04, 0.2)}
      >
        <div className="h-full">
          <article
            className={`roadmap-card group relative h-full overflow-hidden rounded-3xl border p-5 transition-all sm:p-6 ${
              milestone.status === "locked"
                ? "border-white/[0.08] opacity-65"
                : milestone.status === "in_progress"
                  ? "border-violet-400/35 shadow-[0_26px_70px_rgba(66,48,150,.22)]"
                  : "border-emerald-400/25"
            }`}
          >
            <span className="absolute -right-2 -top-5 font-display text-8xl text-white/[0.025]" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="relative">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-[.22em] text-cyan-300/75">
                    Step {index + 1}
                  </span>
                  <h2 className={`mt-1 font-display text-lg uppercase tracking-tight sm:text-xl ${milestone.status === "locked" ? "text-slate-400" : "text-white"}`}>
                    {milestone.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {milestone.description}
                  </p>
                </div>
                {statusBadge(milestone.status)}
              </div>

              {milestone.status === "in_progress" && totalCourses > 0 ? (
                <div className="mt-5 rounded-2xl border border-violet-400/15 bg-violet-400/[0.06] p-3">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      {completedCourses} of {totalCourses} courses complete
                    </span>
                    <span className="font-semibold text-violet-200">{progress}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                    <div className="xp-bar h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              ) : null}

              <ul className="mt-5 space-y-2.5">
                {milestone.courses.map((course, courseIndex) => (
                  <li key={course.id} className="course-quest flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.07] bg-black/20 px-4 py-3 transition-colors hover:border-cyan-300/20 hover:bg-cyan-300/[0.03]">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-100">{course.title}</p>
                        <span className="rounded-full border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 text-xs text-slate-500">
                          {course.duration_weeks} {course.duration_weeks === 1 ? "week" : "weeks"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-5 text-slate-400">{course.description}</p>
                    </div>
                    <div className="shrink-0">
                      <CourseToggle
                        course={course}
                        courseAvailable={
                          milestoneAvailable && courseIndex === nextCourseIndex
                        }
                        lockedMessage={
                          milestoneAvailable
                            ? "Complete the activity above first"
                            : "Locked"
                        }
                      />
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-5 border-t border-white/[0.08] pt-4">
                <MilestoneAction
                  status={milestone.status}
                  canComplete={canComplete}
                />
              </div>
            </div>
          </article>
        </div>
      </Reveal>
      {index === total - 1 ? <div className="roadmap-finish" aria-hidden="true"><Sparkles className="h-4 w-4" /></div> : null}
    </li>
  );
}

export default async function RoadmapPage() {
  let roadmap = await getRoadmap();
  if (roadmap) roadmap = (await ensureMilestones(roadmap.id)) ?? roadmap;

  if (!roadmap) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <Reveal direction="scale">
          <div className="glass-panel rounded-3xl px-7 py-10 sm:px-12">
            <h1 className="font-display text-2xl uppercase tracking-tight text-foreground">Your roadmap is waiting</h1>
            <p className="mt-2 max-w-md text-slate-400">Complete the career assessment to generate your personalized learning roadmap.</p>
            <Link href="/assessment" className="hero-cta mt-6 inline-flex rounded-xl bg-accent px-6 py-3 font-semibold text-white transition-colors hover:brightness-110">Take the assessment</Link>
          </div>
        </Reveal>
      </main>
    );
  }

  const total = roadmap.milestones.length;
  const completed = roadmap.milestones.filter(
    (milestone) => milestone.status === "completed"
  ).length;
  const activeMilestoneIndex = roadmap.milestones.findIndex(
    (milestone) => milestone.status !== "completed"
  );
  const careerChoiceMap = new Map<string, (typeof CAREERS)[number]>();
  for (const career of CAREERS) {
    if (!careerChoiceMap.has(career.title) || career.id === roadmap.career_id) {
      careerChoiceMap.set(career.title, career);
    }
  }
  const careerChoices = Array.from(careerChoiceMap.values()).map(({ id, title, category, description, icon }) => ({
    id,
    title,
    category,
    description,
    icon,
  }));

  return (
    <main className="roadmap-world relative w-full flex-1 overflow-hidden px-4 py-12 sm:px-6 lg:py-16">
      <div className="neo-grid pointer-events-none absolute inset-x-0 top-0 h-[680px]" aria-hidden="true" />
      <div className="pointer-events-none absolute left-[8%] top-28 h-72 w-72 rounded-full bg-violet-500/10 blur-[100px]" aria-hidden="true" />
      <div className="pointer-events-none absolute right-[5%] top-[42rem] h-80 w-80 rounded-full bg-cyan-400/[0.07] blur-[110px]" aria-hidden="true" />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <header className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
          <Reveal>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <h1 className="font-display text-3xl uppercase tracking-tight text-white sm:text-5xl">{roadmap.career_title}</h1>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${roadmap.status === "completed" ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300" : roadmap.status === "active" ? "border-violet-400/25 bg-violet-400/10 text-violet-200" : "border-cyan-300/20 bg-cyan-300/[0.06] text-cyan-100"}`}>
                {roadmap.status === "completed" ? "Roadmap complete" : roadmap.status === "active" ? "Active" : "Ready to start"}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-400">{completed} of {total} milestones complete</p>
            <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-slate-500">
              Built from your selected career, skill gaps, learning style, and weekly study capacity. Update your profile before choosing a path for the best result.
            </p>
            <p className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.06] px-4 py-2 text-xs font-semibold text-cyan-100">
              <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" /> Complete the current milestone to unlock the next one
            </p>
            <CareerSwitcher
              careers={careerChoices}
              currentCareerId={roadmap.career_id}
              currentCareerTitle={roadmap.career_title}
            />
            <div className="mx-auto mt-5 h-1.5 max-w-sm overflow-hidden rounded-full bg-white/[0.07]"><div className="xp-bar h-full rounded-full" style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }} /></div>
          </Reveal>
        </header>

        <ol className="roadmap-route">
          {roadmap.milestones.map((milestone, index) => {
            const sequenceStatus: MilestoneStatus = milestone.status === "completed"
              ? "completed"
              : index === activeMilestoneIndex
                ? "in_progress"
                : "locked";
            return (
              <MilestoneCard
                key={milestone.id}
                milestone={{ ...milestone, status: sequenceStatus }}
                index={index}
                total={total}
                milestoneAvailable={index === activeMilestoneIndex}
              />
            );
          })}
        </ol>
      </div>
    </main>
  );
}
