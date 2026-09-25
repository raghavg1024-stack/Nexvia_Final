"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ArrowRight, BriefcaseBusiness, Search, ShieldCheck, X } from "lucide-react";
import {
  changeRoadmapCareer,
  type CareerSwitchState,
} from "@/lib/roadmap";

type CareerChoice = {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: string;
};

const initialState: CareerSwitchState = { ok: true };

export function CareerSwitcher({
  careers,
  currentCareerId,
  currentCareerTitle,
}: {
  careers: CareerChoice[];
  currentCareerId: string;
  currentCareerTitle: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<CareerSwitchState>(initialState);

  const filteredCareers = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return careers;
    return careers.filter((career) =>
      `${career.title} ${career.category} ${career.description}`.toLowerCase().includes(term),
    );
  }, [careers, query]);

  const selectedCareer = careers.find((career) => career.id === selectedId) ?? null;

  function closeDialog() {
    if (pending) return;
    setOpen(false);
    setQuery("");
    setSelectedId("");
    setState(initialState);
  }

  async function confirmSwitch() {
    if (!selectedCareer || selectedCareer.id === currentCareerId || pending) return;

    setPending(true);
    setState(initialState);
    const formData = new FormData();
    formData.set("careerId", selectedCareer.id);

    try {
      const result = await changeRoadmapCareer(initialState, formData);
      setState(result);
      if (result.ok) {
        setOpen(false);
        setSelectedId("");
        setQuery("");
        router.refresh();
      }
    } catch {
      setState({
        ok: false,
        message: "The career could not be changed right now. Please try again.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-5 inline-flex items-center gap-2 rounded-xl border border-violet-300/25 bg-violet-400/10 px-4 py-2.5 text-sm font-semibold text-violet-100 transition hover:border-violet-300/45 hover:bg-violet-400/20"
      >
        <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
        Change career
      </button>

      {open ? createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050711]/90 p-4 backdrop-blur-md"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="career-switch-title"
            className="glass-panel relative flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-violet-300/20 shadow-[0_34px_100px_rgba(22,11,72,.6)]"
          >
            <div className="border-b border-white/[0.08] px-5 py-5 sm:px-7">
              <button
                type="button"
                onClick={closeDialog}
                disabled={pending}
                aria-label="Close career chooser"
                className="absolute right-4 top-4 rounded-lg border border-white/10 bg-white/[0.04] p-2 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
              <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-300">Build a new path</p>
              <h2 id="career-switch-title" className="mt-1 pr-12 font-display text-2xl uppercase text-white sm:text-3xl">
                Choose your career
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Select the career you want to pursue. Nexvia will create a new personalized sequence based on that career, your profile, and your weekly study time.
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                <span className="sr-only">Search careers</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search software, design, business, healthcare…"
                  className="w-full rounded-xl border border-white/10 bg-black/25 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-300/45 focus:ring-2 focus:ring-violet-400/10"
                />
              </label>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCareers.map((career) => {
                  const isCurrent = career.id === currentCareerId;
                  const isSelected = career.id === selectedId;
                  return (
                    <button
                      type="button"
                      key={career.id}
                      disabled={isCurrent || pending}
                      onClick={() => setSelectedId(career.id)}
                      className={`rounded-2xl border p-4 text-left transition disabled:cursor-default ${
                        isSelected
                          ? "border-cyan-300/60 bg-cyan-300/10 shadow-[0_0_28px_rgba(34,211,238,.1)]"
                          : isCurrent
                            ? "border-emerald-400/25 bg-emerald-400/[0.07]"
                            : "border-white/[0.08] bg-white/[0.025] hover:border-violet-300/35 hover:bg-violet-400/[0.07]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-2xl" aria-hidden="true">{career.icon}</span>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${isCurrent ? "bg-emerald-400/10 text-emerald-300" : "bg-white/[0.05] text-slate-500"}`}>
                          {isCurrent ? "Current" : career.category}
                        </span>
                      </div>
                      <p className="mt-3 font-semibold text-white">{career.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{career.description}</p>
                    </button>
                  );
                })}
              </div>

              {filteredCareers.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-400">No matching career found. Try another keyword.</p>
              ) : null}
            </div>

            <div className="border-t border-white/[0.08] bg-black/20 px-5 py-4 sm:px-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2 text-xs leading-5 text-slate-400">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
                  <span>Your {currentCareerTitle} progress stays saved as a paused roadmap.</span>
                </div>
                <button
                  type="button"
                  onClick={confirmSwitch}
                  disabled={!selectedCareer || selectedCareer.id === currentCareerId || pending}
                  className="hero-cta inline-flex min-w-48 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {pending ? "Creating roadmap…" : selectedCareer ? `Switch to ${selectedCareer.title}` : "Choose a career"}
                  {!pending && selectedCareer ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
                </button>
              </div>
              {state.ok === false && state.message ? (
                <p role="alert" className="mt-3 text-right text-sm text-rose-300">{state.message}</p>
              ) : null}
            </div>
          </section>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
