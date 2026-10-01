"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

const steps = ["Profile", "Skill gap", "Career match", "Roadmap", "Practice", "Opportunity"] as const;

export function DemoJourneyAnimation() {
  const reduceMotion = useReducedMotion();
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const startedAt = performance.now();
    let frame = 0;
    function update(now: number) {
      const progress = Math.min((now - startedAt) / 1000, 1);
      setScore(Math.round(89 * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(update);
    }
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [reduceMotion]);

  const visibleScore = reduceMotion ? 89 : score;
  return (
    <section aria-label="Animated Nexvia career journey" className="mt-6 overflow-hidden rounded-3xl border border-cyan-400/20 bg-[#0b1220] p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-300">How Nexvia moves a learner forward</p><p className="mt-1 text-sm text-slate-400">Each result unlocks the next useful action.</p></div><div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[.06] px-4 py-2 text-sm font-bold text-emerald-300">Career relevance {visibleScore}%</div></div>
      <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"><span className="demo-flow-line absolute left-[8%] right-[8%] top-5 hidden h-px bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 lg:block" aria-hidden="true" />{steps.map((step, index) => <div key={step} className="demo-flow-step relative z-10 rounded-xl border border-white/10 bg-[#101827] p-3 text-center" style={{ animationDelay: `${index * 160}ms` }}><span className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full border text-xs font-black ${index === steps.length - 1 ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : "border-cyan-400/30 bg-cyan-400/10 text-cyan-200"}`}>{index + 1}</span><p className="mt-2 text-xs font-semibold text-slate-200">{step}</p></div>)}</div>
      <p className="mt-5 text-xs text-slate-500">Based on profile signals, skill evidence, interests, career goals and project history.</p>
    </section>
  );
}
