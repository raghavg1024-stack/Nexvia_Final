import Link from "next/link";
import { redirect } from "next/navigation";
import { loadParentDashboard, type ParentDashboardData } from "@/lib/parent";
import { createDemoParentDashboard } from "@/lib/parent-demo";
import { ParentEncouragementForm } from "./parent-encouragement-form";

type PageProps = {
  searchParams: Promise<{ student?: string; demo?: string }>;
};

function percentage(completed: number, total: number) {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

function formatDate(value?: string | null) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

function getProgress(data: ParentDashboardData) {
  const milestones = data.roadmap?.milestones ?? [];
  const courses = milestones.flatMap((milestone) => milestone.courses ?? []);
  if (courses.length > 0) {
    const completed = courses.filter((course) => course.status === "completed").length;
    return { completed, total: courses.length, value: percentage(completed, courses.length) };
  }
  const completed = milestones.filter((milestone) => milestone.status === "completed").length;
  return { completed, total: milestones.length, value: percentage(completed, milestones.length) };
}

function daysSince(value?: string | null) {
  if (!value) return null;
  const elapsed = Date.now() - new Date(value).getTime();
  return Math.max(0, Math.floor(elapsed / 86_400_000));
}

function conversationQuestions(data: ParentDashboardData, progress: number) {
  const name = data.student.name.split(" ")[0] || "your learner";
  const career = data.roadmap?.career_title ?? data.recommendation?.career_title;
  const growthArea = data.analysis?.growth_areas?.[0] ?? data.recommendation?.growth_opportunities?.[0];
  const questions = [
    career
      ? `What feels most interesting to you about ${career} right now?`
      : "Which career possibility are you most curious to explore next?",
    progress > 0
      ? `You have completed ${progress}% of your roadmap. Which next step feels most achievable this week?`
      : `What would help you take the first small step on your roadmap, ${name}?`,
    growthArea
      ? `How can I support you while you work on ${growthArea}?`
      : "What kind of support would make your learning feel easier this week?",
  ];
  return questions;
}

function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-3 font-display text-3xl tracking-tight text-foreground">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
    </div>
  );
}

function scoreGrade(score: number) {
  if (score >= 85) return "A";
  if (score >= 75) return "B+";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  return "—";
}

export default async function ParentDashboardPage({ searchParams }: PageProps) {
  const { student, demo } = await searchParams;
  const liveDashboard = await loadParentDashboard(student);
  const isDemo = demo === "1";
  const dashboard = liveDashboard ?? (isDemo
    ? { role: "student" as const, linkId: null, data: createDemoParentDashboard() }
    : null);
  if (!dashboard) redirect("/parent/access");

  const { data, role, linkId } = dashboard;
  const progress = getProgress(data);
  const lastActivity = data.roadmap?.last_activity_at ?? data.student.last_active_day;
  const inactiveDays = daysSince(lastActivity);
  const readiness = data.readiness?.overall ?? 0;
  const interviewAverage = data.interviews?.average_score ?? 0;
  const questions = conversationQuestions(data, progress.value);
  const strengths = data.analysis?.strengths ?? data.recommendation?.existing_strengths ?? [];
  const growthAreas =
    data.analysis?.growth_areas ?? data.recommendation?.growth_opportunities ?? [];
  const reportRows = [
    { label: "Technical skills", score: data.readiness?.technical_skills ?? 0, note: "Tools, concepts, and practical practice" },
    { label: "Communication", score: data.readiness?.communication ?? 0, note: "Explaining ideas and interview responses" },
    { label: "Projects", score: data.readiness?.projects ?? 0, note: "Applying learning in real work" },
    { label: "Interview practice", score: data.readiness?.interview_readiness ?? 0, note: "Mock interview performance and confidence" },
    { label: "Roadmap consistency", score: progress.value, note: "Completion of assigned learning items" },
  ];

  const engagement =
    inactiveDays === null
      ? { label: "Not started", tone: "text-amber-500", message: "No roadmap activity has been recorded yet." }
      : inactiveDays <= 2
        ? { label: "On track", tone: "text-emerald-500", message: `Roadmap activity was recorded ${inactiveDays === 0 ? "today" : `${inactiveDays} day${inactiveDays === 1 ? "" : "s"} ago`}.` }
        : inactiveDays <= 6
          ? { label: "Check in", tone: "text-amber-500", message: `No roadmap activity has been recorded for ${inactiveDays} days.` }
          : { label: "Support needed", tone: "text-red-500", message: `The roadmap has been inactive for ${inactiveDays} days. A supportive conversation may help.` };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <Link href="/parent/access" className="text-sm font-semibold text-accent hover:underline">
        Back to Parent Portal
      </Link>

      <header className="mt-4 rounded-3xl border border-line bg-card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {isDemo ? "Sample data · demo preview" : role === "parent" ? "Verified parent view" : "Learner preview"}
            </p>
            <h1 className="mt-2 font-display text-3xl uppercase tracking-tight text-foreground">
              {data.student.name}&apos;s progress
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              {data.roadmap?.career_title ?? data.recommendation?.career_title ?? "Career direction is still being explored"}
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-background px-4 py-3 text-right">
            <p className={`text-sm font-semibold ${engagement.tone}`}>{engagement.label}</p>
            <p className="mt-1 max-w-xs text-xs text-slate-500">{engagement.message}</p>
          </div>
        </div>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Roadmap progress"
          value={`${progress.value}%`}
          detail={`${progress.completed} of ${progress.total} learning items completed`}
        />
        <StatCard
          label="Career readiness"
          value={`${readiness}%`}
          detail={data.readiness ? "Calculated from current learning and practice" : "Complete learning activities to calculate readiness"}
        />
        <StatCard
          label="Interview average"
          value={`${interviewAverage}%`}
          detail={`${data.interviews?.completed_count ?? 0} completed mock interview${data.interviews?.completed_count === 1 ? "" : "s"}`}
        />
        <StatCard
          label="Current streak"
          value={`${data.student.current_streak_days ?? 0} days`}
          detail={`Level ${data.student.level ?? 1} with ${data.student.xp ?? 0} XP`}
        />
      </section>

      {(data.overdue_tasks ?? []).length > 0 ? (
        <section className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/[0.07] p-6">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-amber-300">Support may be helpful</p>
          <h2 className="mt-2 font-display text-xl uppercase text-white">Overdue roadmap tasks</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {data.overdue_tasks?.map((task) => (
              <div key={task.id} className="rounded-xl border border-amber-300/15 bg-background/70 p-4">
                <p className="font-semibold text-white">{task.title}</p>
                <p className="mt-1 text-xs text-slate-400">{task.milestone_title} · due {formatDate(task.due_at)}</p>
                <p className="mt-2 text-xs font-semibold text-amber-300">{task.days_overdue} day{task.days_overdue === 1 ? "" : "s"} overdue</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-6 overflow-hidden rounded-2xl border border-line bg-card">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Student report card
            </p>
            <h2 className="mt-2 font-display text-xl uppercase tracking-tight text-foreground">
              {isDemo ? "August learning snapshot" : "Current learning snapshot"}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {isDemo
                ? "Illustrative sample data for the Parent Portal demo."
                : "A clear view of current Nexvia learning evidence; it is not a school transcript."}
            </p>
          </div>
          <div className="rounded-2xl border border-accent/30 bg-accent-soft px-4 py-3 text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">Overall readiness</p>
            <p className="mt-1 font-display text-3xl text-foreground">{readiness}%</p>
          </div>
        </div>
        <div className="divide-y divide-line">
          {reportRows.map((row) => (
            <div key={row.label} className="grid gap-3 p-5 sm:grid-cols-[1fr_1.4fr_auto] sm:items-center">
              <div>
                <p className="font-semibold text-foreground">{row.label}</p>
                <p className="mt-1 text-xs text-slate-500">{row.note}</p>
              </div>
              <div>
                <div className="h-2 overflow-hidden rounded-full bg-background">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(0, Math.min(row.score, 100))}%` }} />
                </div>
                <p className="mt-2 text-xs font-medium text-slate-400">{row.score}% demonstrated</p>
              </div>
              <span className="inline-flex h-10 w-12 items-center justify-center rounded-xl border border-line bg-background font-display text-lg text-foreground">
                {scoreGrade(row.score)}
              </span>
            </div>
          ))}
        </div>
        <div className="grid gap-4 border-t border-line bg-background/60 p-5 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">Attendance</p>
            <p className="mt-1 font-semibold text-foreground">{isDemo ? "94%" : "Learning activity tracked in roadmap"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">Mock interviews</p>
            <p className="mt-1 font-semibold text-foreground">{data.interviews?.completed_count ?? 0} completed · {interviewAverage}% average</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">Teacher note</p>
            <p className="mt-1 font-semibold text-foreground">{isDemo ? "Keep building presentation confidence." : "Use the growth areas below to guide the next check-in."}</p>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Career direction
            </p>
            {data.recommendation ? (
              <div className="mt-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-display text-xl uppercase tracking-tight text-foreground">
                    {data.recommendation.career_title}
                  </h2>
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-accent">
                    {data.recommendation.match_percentage ?? 0}% match
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {data.recommendation.description}
                </p>
                {(data.recommendation.reasons ?? []).length > 0 && (
                  <ul className="mt-4 space-y-2 text-sm text-slate-300">
                    {data.recommendation.reasons?.slice(0, 3).map((reason) => (
                      <li key={reason} className="flex gap-2">
                        <span className="text-accent">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">
                No completed assessment or career recommendation is available yet.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-line bg-card p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Learning roadmap
                </p>
                <h2 className="mt-2 font-display text-xl uppercase tracking-tight text-foreground">
                  {data.roadmap?.career_title ?? "Roadmap not created"}
                </h2>
              </div>
              <p className="text-xs text-slate-500">Last activity: {formatDate(lastActivity)}</p>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-background">
              <div className="h-full rounded-full bg-accent" style={{ width: `${progress.value}%` }} />
            </div>
            <div className="mt-5 space-y-3">
              {(data.roadmap?.milestones ?? []).map((milestone) => {
                const completedCourses = (milestone.courses ?? []).filter(
                  (course) => course.status === "completed",
                ).length;
                return (
                  <article key={milestone.id} className="rounded-xl border border-line bg-background p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-foreground">{milestone.title}</h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {completedCourses} of {milestone.courses?.length ?? 0} courses completed
                        </p>
                      </div>
                      <span className="text-xs font-semibold capitalize text-accent">
                        {milestone.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </article>
                );
              })}
              {!data.roadmap && (
                <p className="text-sm text-slate-400">
                  The learner needs to select a career before a roadmap can be created.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Recent verified activity
            </p>
            <div className="mt-4 space-y-3">
              {(data.recent_activity ?? []).map((activity) => (
                <div key={`${activity.created_at}-${activity.reason}`} className="flex items-start justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm text-foreground">{activity.reason}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDate(activity.created_at)}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-500">+{activity.amount} XP</span>
                </div>
              ))}
              {(data.recent_activity ?? []).length === 0 && (
                <p className="text-sm text-slate-400">No verified learning activity is available yet.</p>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-line bg-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Strengths and growth
            </p>
            <h2 className="mt-4 text-sm font-semibold text-emerald-500">Current strengths</h2>
            <ul className="mt-2 space-y-2 text-sm text-slate-300">
              {strengths.slice(0, 4).map((strength) => <li key={strength}>• {strength}</li>)}
              {strengths.length === 0 && <li className="text-slate-500">Complete the assessment to identify strengths.</li>}
            </ul>
            <h2 className="mt-5 text-sm font-semibold text-amber-500">Growth opportunities</h2>
            <ul className="mt-2 space-y-2 text-sm text-slate-300">
              {growthAreas.slice(0, 4).map((area) => <li key={area}>• {area}</li>)}
              {growthAreas.length === 0 && <li className="text-slate-500">No growth areas have been calculated yet.</li>}
            </ul>
          </section>

          <section className="rounded-2xl border border-line bg-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Conversation starters
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              {questions.map((question) => (
                <li key={question} className="rounded-xl border border-line bg-background p-3">
                  {question}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-line bg-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Encouragement
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Send a supportive note based on real progress. Nexvia delivers the message exactly as written.
            </p>
            {role === "parent" && linkId ? (
              <ParentEncouragementForm
                linkId={linkId}
                studentId={data.student.id}
                studentName={data.student.name.split(" ")[0] || "your learner"}
              />
            ) : (
              <p className="mt-4 rounded-xl border border-line bg-background p-3 text-sm text-slate-500">
                This is your learner preview. Linked parents can send encouragement from their account.
              </p>
            )}
          </section>

          {(data.encouragements ?? []).length > 0 && (
            <section className="rounded-2xl border border-line bg-card p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Recent family notes
              </p>
              <div className="mt-4 space-y-3">
                {data.encouragements?.slice(0, 4).map((note) => (
                  <blockquote key={note.id} className="rounded-xl border border-line bg-background p-4 text-sm leading-6 text-slate-300">
                    “{note.message}”
                    <footer className="mt-2 text-xs text-slate-500">{formatDate(note.created_at)}</footer>
                  </blockquote>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}
