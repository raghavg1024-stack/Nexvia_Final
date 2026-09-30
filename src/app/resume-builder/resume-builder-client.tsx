"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Download,
  FileText,
  GraduationCap,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";

type ResumeBuilderVariant = "student" | "academia";

type ResumeEntry = {
  id: string;
  title: string;
  organization: string;
  period: string;
  description: string;
};

type ResumeDraft = {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  link: string;
  summary: string;
  skills: string;
  experience: ResumeEntry[];
  education: ResumeEntry[];
  highlights: ResumeEntry[];
};

type ResumeBuilderProps = {
  variant: ResumeBuilderVariant;
  profile: {
    fullName: string;
    email: string;
    headline: string;
    skills: string[];
  };
};

type EntrySection = "experience" | "education" | "highlights";

const fieldClass =
  "mt-2 h-11 w-full rounded-xl border border-line bg-background px-3 text-sm text-foreground outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10";
const areaClass = `${fieldClass} min-h-24 resize-y py-3 leading-6`;

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function emptyEntry(): ResumeEntry {
  return { id: makeId(), title: "", organization: "", period: "", description: "" };
}

function initialDraft(variant: ResumeBuilderVariant, profile: ResumeBuilderProps["profile"]): ResumeDraft {
  return {
    fullName: profile.fullName,
    headline: profile.headline,
    email: profile.email,
    phone: "",
    location: "",
    link: "",
    summary: "",
    skills: profile.skills.join(", "),
    experience: [emptyEntry()],
    education: [emptyEntry()],
    highlights: [emptyEntry()],
  };
}

function splitSkills(value: string) {
  return value
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b border-slate-300 pb-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-900">
      {children}
    </h2>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "text" | "email" | "tel" | "url";
}) {
  return (
    <label className="block text-sm font-semibold text-foreground">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={fieldClass}
      />
    </label>
  );
}

function EntryEditor({
  entry,
  section,
  index,
  variant,
  onChange,
  onRemove,
}: {
  entry: ResumeEntry;
  section: EntrySection;
  index: number;
  variant: ResumeBuilderVariant;
  onChange: (field: keyof ResumeEntry, value: string) => void;
  onRemove: () => void;
}) {
  const isEducation = section === "education";
  const isHighlight = section === "highlights";
  const titleLabel = isEducation
    ? "Qualification"
    : isHighlight
      ? variant === "academia"
        ? "Publication or research title"
        : "Project or achievement"
      : "Role";
  const organizationLabel = isEducation
    ? "Institution"
    : isHighlight
      ? variant === "academia"
        ? "Journal, conference, or institution"
        : "Technology or organisation"
      : "Organisation";

  return (
    <div className="rounded-2xl border border-line bg-background/65 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-300">Entry {index + 1}</p>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-rose-400/10 hover:text-rose-300"
          aria-label={`Remove entry ${index + 1}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={titleLabel} value={entry.title} onChange={(value) => onChange("title", value)} placeholder={isEducation ? "B.Tech Computer Science" : "Frontend Developer"} />
        <Field label={organizationLabel} value={entry.organization} onChange={(value) => onChange("organization", value)} placeholder={isEducation ? "University name" : "Organisation name"} />
        <div className="sm:col-span-2">
          <Field label="Period" value={entry.period} onChange={(value) => onChange("period", value)} placeholder="2024 – Present" />
        </div>
        <label className="block text-sm font-semibold text-foreground sm:col-span-2">
          Evidence and details
          <textarea
            value={entry.description}
            onChange={(event) => onChange("description", event.target.value)}
            placeholder="Describe measurable outcomes, responsibilities, tools, or results."
            className={areaClass}
          />
        </label>
      </div>
    </div>
  );
}

export function ResumeBuilder({ variant, profile }: ResumeBuilderProps) {
  const storageKey = `nexvia-resume-builder-${variant}`;
  const [draft, setDraft] = useState<ResumeDraft>(() => initialDraft(variant, profile));
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<string>("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(storageKey);
        if (saved) setDraft(JSON.parse(saved) as ResumeDraft);
      } catch {
        window.localStorage.removeItem(storageKey);
      } finally {
        setHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(storageKey, JSON.stringify(draft));
      setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }, 350);
    return () => window.clearTimeout(timer);
  }, [draft, hydrated, storageKey]);

  const completion = useMemo(() => {
    const checks = [
      draft.fullName,
      draft.headline,
      draft.email,
      draft.summary,
      draft.skills,
      draft.education.some((entry) => entry.title && entry.organization),
      draft.experience.some((entry) => entry.title && entry.organization),
      draft.highlights.some((entry) => entry.title),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [draft]);

  const updateField = (field: keyof ResumeDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const updateEntry = (section: EntrySection, id: string, field: keyof ResumeEntry, value: string) => {
    setDraft((current) => ({
      ...current,
      [section]: current[section].map((entry) => entry.id === id ? { ...entry, [field]: value } : entry),
    }));
  };

  const addEntry = (section: EntrySection) => {
    setDraft((current) => ({ ...current, [section]: [...current[section], emptyEntry()] }));
  };

  const removeEntry = (section: EntrySection, id: string) => {
    setDraft((current) => {
      const remaining = current[section].filter((entry) => entry.id !== id);
      return { ...current, [section]: remaining.length ? remaining : [emptyEntry()] };
    });
  };

  const resetDraft = () => {
    if (!window.confirm("Clear this saved resume draft and start again?")) return;
    window.localStorage.removeItem(storageKey);
    setDraft(initialDraft(variant, profile));
  };

  const labels = variant === "academia"
    ? {
        eyebrow: "Academic CV studio",
        title: "Build your academic resume",
        description: "Create a clear faculty profile for teaching, research, FDP, consultancy, and collaboration opportunities.",
        highlights: "Research & publications",
        highlightButton: "Add research entry",
      }
    : {
        eyebrow: "Student resume studio",
        title: "Build an opportunity-ready resume",
        description: "Turn your education, skills, projects, and experience into a focused resume for internships and jobs.",
        highlights: "Projects & achievements",
        highlightButton: "Add project",
      };

  const contactItems = [draft.email, draft.phone, draft.location, draft.link].filter(Boolean);
  const skills = splitSkills(draft.skills);

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-300">
            <Sparkles className="h-3.5 w-3.5" /> {labels.eyebrow}
          </div>
          <h1 className="mt-4 font-display text-3xl uppercase tracking-tight text-foreground sm:text-4xl">{labels.title}</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">{labels.description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={resetDraft} className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-card px-4 text-sm font-semibold text-slate-300 transition hover:border-rose-400/30 hover:text-rose-300">
            <RotateCcw className="h-4 w-4" /> Start over
          </button>
          <button type="button" onClick={() => window.print()} className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-500 px-5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400">
            <Download className="h-4 w-4" /> Print / Save PDF
          </button>
        </div>
      </header>

      <section className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="h-2 overflow-hidden rounded-full bg-blue-950/50">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500" style={{ width: `${completion}%` }} />
        </div>
        <p className="text-xs font-semibold text-slate-400">{completion}% complete{savedAt ? ` · saved ${savedAt}` : ""}</p>
      </section>

      <div className="mt-7 grid items-start gap-7 xl:grid-cols-[minmax(0,0.92fr)_minmax(520px,1.08fr)]">
        <div className="resume-editor space-y-5">
          <section className="rounded-3xl border border-line bg-card p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300"><FileText className="h-5 w-5" /></div>
              <div><h2 className="font-bold text-foreground">Contact and positioning</h2><p className="text-xs text-slate-500">The information recruiters see first.</p></div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" value={draft.fullName} onChange={(value) => updateField("fullName", value)} placeholder="Your name" />
              <Field label="Professional headline" value={draft.headline} onChange={(value) => updateField("headline", value)} placeholder={variant === "academia" ? "Assistant Professor · AI Researcher" : "Frontend Developer · B.Tech Student"} />
              <Field label="Email" type="email" value={draft.email} onChange={(value) => updateField("email", value)} placeholder="you@example.com" />
              <Field label="Phone" type="tel" value={draft.phone} onChange={(value) => updateField("phone", value)} placeholder="+91 98765 43210" />
              <Field label="Location" value={draft.location} onChange={(value) => updateField("location", value)} placeholder="Pune, Maharashtra" />
              <Field label="LinkedIn or portfolio" type="url" value={draft.link} onChange={(value) => updateField("link", value)} placeholder="linkedin.com/in/your-name" />
              <label className="block text-sm font-semibold text-foreground sm:col-span-2">Professional summary<textarea value={draft.summary} onChange={(event) => updateField("summary", event.target.value)} placeholder="Write 3–4 lines focused on strengths, evidence, and the opportunity you want." className={areaClass} /></label>
              <label className="block text-sm font-semibold text-foreground sm:col-span-2">Skills<textarea value={draft.skills} onChange={(event) => updateField("skills", event.target.value)} placeholder="JavaScript, React, SQL, communication, research" className={areaClass} /><span className="mt-2 block text-xs font-normal text-slate-500">Separate skills with commas.</span></label>
            </div>
          </section>

          {([
            ["experience", "Experience", "Add experience"],
            ["education", "Education", "Add education"],
            ["highlights", labels.highlights, labels.highlightButton],
          ] as const).map(([section, title, buttonLabel]) => (
            <section key={section} className="rounded-3xl border border-line bg-card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300"><GraduationCap className="h-5 w-5" /></div>
                  <h2 className="font-bold text-foreground">{title}</h2>
                </div>
                <button type="button" onClick={() => addEntry(section)} className="inline-flex items-center gap-2 rounded-xl border border-blue-400/25 bg-blue-400/10 px-3 py-2 text-xs font-bold text-blue-200 transition hover:bg-blue-400/20"><Plus className="h-3.5 w-3.5" /> {buttonLabel}</button>
              </div>
              <div className="mt-5 space-y-4">
                {draft[section].map((entry, index) => (
                  <EntryEditor key={entry.id} entry={entry} section={section} index={index} variant={variant} onChange={(field, value) => updateEntry(section, entry.id, field, value)} onRemove={() => removeEntry(section, entry.id)} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="xl:sticky xl:top-24">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Live preview</p>
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" /> Autosaved locally</span>
          </div>
          <article id="resume-print-area" className="min-h-[760px] bg-white p-8 text-slate-900 shadow-2xl shadow-black/30 sm:p-11">
            <header className="border-b-2 border-blue-700 pb-5">
              <h2 className="text-3xl font-black tracking-tight text-slate-950">{draft.fullName || "Your Name"}</h2>
              <p className="mt-1 text-base font-semibold text-blue-700">{draft.headline || "Professional headline"}</p>
              {contactItems.length > 0 && <p className="mt-3 break-words text-[11px] leading-5 text-slate-600">{contactItems.join("  •  ")}</p>}
            </header>

            <div className="mt-6 space-y-6 text-[12px] leading-[1.55]">
              {draft.summary && <section><SectionHeading>Profile</SectionHeading><p className="mt-2 whitespace-pre-line text-slate-700">{draft.summary}</p></section>}
              {skills.length > 0 && <section><SectionHeading>Core skills</SectionHeading><div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-slate-700">{skills.map((skill) => <span key={skill}>{skill}</span>)}</div></section>}
              {([
                ["experience", "Experience"],
                ["education", "Education"],
                ["highlights", labels.highlights],
              ] as const).map(([section, title]) => {
                const entries = draft[section].filter((entry) => entry.title || entry.organization || entry.description);
                if (!entries.length) return null;
                return <section key={section}><SectionHeading>{title}</SectionHeading><div className="mt-3 space-y-4">{entries.map((entry) => <div key={entry.id}><div className="flex items-start justify-between gap-4"><div><h3 className="font-bold text-slate-950">{entry.title || "Untitled entry"}</h3><p className="font-medium text-blue-700">{entry.organization}</p></div><p className="shrink-0 text-[10px] font-semibold text-slate-500">{entry.period}</p></div>{entry.description && <p className="mt-1.5 whitespace-pre-line text-slate-700">{entry.description}</p>}</div>)}</div></section>;
              })}
            </div>
          </article>
        </aside>
      </div>

      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 0; }
          body * { visibility: hidden !important; }
          #resume-print-area, #resume-print-area * { visibility: visible !important; }
          #resume-print-area {
            position: absolute !important;
            inset: 0 !important;
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 14mm 16mm !important;
            border: 0 !important;
            box-shadow: none !important;
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
