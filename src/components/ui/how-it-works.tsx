"use client";

import type { CSSProperties } from "react";
import { Pin } from "lucide-react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";

type StepTone = "cyan" | "blue" | "green" | "amber";

export interface HowItWorksStep {
  title: string;
  description: string;
  tone?: StepTone;
}

interface StepPosition {
  className: string;
  rotate: string;
}

interface HowItWorksProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  steps: HowItWorksStep[];
  className?: string;
}

const tones: Record<StepTone, { panel: string; text: string; border: string }> = {
  cyan: {
    panel: "bg-cyan-400/[.07]",
    text: "text-cyan-300",
    border: "border-cyan-400/20",
  },
  blue: {
    panel: "bg-blue-500/[.08]",
    text: "text-blue-300",
    border: "border-blue-400/20",
  },
  green: {
    panel: "bg-emerald-500/[.08]",
    text: "text-emerald-300",
    border: "border-emerald-400/20",
  },
  amber: {
    panel: "bg-amber-500/[.08]",
    text: "text-amber-300",
    border: "border-amber-400/20",
  },
};

const positions: StepPosition[] = [
  { className: "md:absolute md:left-[8%] md:top-0", rotate: "md:rotate-2" },
  { className: "md:absolute md:right-[8%] md:top-[105px]", rotate: "md:-rotate-2" },
  { className: "md:absolute md:left-[8%] md:top-[330px]", rotate: "md:rotate-2" },
  { className: "md:absolute md:right-[8%] md:top-[435px]", rotate: "md:-rotate-2" },
  { className: "md:absolute md:left-[8%] md:top-[660px]", rotate: "md:rotate-2" },
];

function StepCard({ step, index }: { step: HowItWorksStep; index: number }) {
  const tone = tones[step.tone ?? "blue"];
  const position = positions[index % positions.length];

  return (
    <article
      className={`relative z-10 w-full transition-transform duration-300 hover:z-20 hover:-translate-y-1 md:w-[300px] ${position.rotate} ${position.className}`}
    >
      <div className="rounded-[24px] border border-line bg-card p-2 shadow-[0_18px_45px_rgba(30,58,138,.1)]">
        <Pin aria-hidden="true" className={`mx-auto mb-4 mt-1 h-7 w-7 ${tone.text}`} />
        <div className={`min-h-48 rounded-2xl border p-5 ${tone.panel} ${tone.border}`}>
          <span className={`font-display text-3xl ${tone.text}`}>{String(index + 1).padStart(2, "0")}</span>
          <h3 className="mt-5 text-xl font-semibold text-foreground">{step.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{step.description}</p>
        </div>
      </div>
    </article>
  );
}

export default function HowItWorks({
  eyebrow = "Your Nexvia journey",
  title = "How to use your career workspace",
  description = "Move through these steps in order. Each completed step gives Nexvia better evidence for your next recommendation.",
  steps,
  className = "",
}: HowItWorksProps) {
  const reduceMotion = useReducedMotion();
  const height = Math.max(360, 940 + Math.max(0, steps.length - 5) * 175);

  return (
    <LazyMotion features={domAnimation}>
      <section className={`relative overflow-hidden rounded-3xl border border-line bg-background px-5 py-8 sm:px-8 ${className}`}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[.08] [background-image:linear-gradient(rgba(148,163,184,.45)_1px,transparent_1px)] [background-size:100%_32px]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-background to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-background to-transparent" />

        <header className="relative z-10 mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">{eyebrow}</p>
          <h2 className="mt-3 font-display text-2xl uppercase tracking-tight text-foreground sm:text-3xl">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">{description}</p>
        </header>

        <div
          className="relative z-10 mx-auto mt-8 flex h-auto max-w-4xl flex-col gap-5 md:block md:h-[var(--journey-height)]"
          style={{ "--journey-height": `${height}px` } as CSSProperties}
        >
          {steps.length > 1 ? (
            <svg aria-hidden="true" className="pointer-events-none absolute inset-0 hidden h-full w-full md:block" viewBox={`0 0 900 ${height}`} preserveAspectRatio="none">
              <m.path
                d="M 210 130 C 430 130, 470 235, 690 235 C 790 235, 520 350, 210 455 C 110 555, 470 565, 690 565 C 790 565, 520 690, 210 785"
                fill="none"
                stroke="currentColor"
                strokeDasharray="8 8"
                strokeLinecap="round"
                strokeWidth="2"
                className="text-cyan-400/30"
                initial={reduceMotion ? false : { strokeDashoffset: 0 }}
                animate={reduceMotion ? undefined : { strokeDashoffset: -64 }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          ) : null}
          {steps.map((step, index) => <StepCard key={step.title} step={step} index={index} />)}
        </div>
      </section>
    </LazyMotion>
  );
}
