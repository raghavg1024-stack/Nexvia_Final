"use client";

import { useActionState } from "react";
import { saveAcademiaSetup, type AcademiaSetupState } from "./actions";

type AcademiaDefaults = {
  full_name?: string;
  institution?: string;
  designation?: string;
  department?: string;
  qualification?: string;
  years_experience?: number;
  skills?: string[];
  phone?: string;
  location?: string;
  linkedin_url?: string;
  collaboration_preferences?: string[];
  availability?: string;
  professional_summary?: string;
};

const initialState: AcademiaSetupState = { error: null };
const inputClass = "mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/15";
const labelClass = "text-sm font-semibold text-slate-300";

export function AcademiaSetupForm({ defaults }: { defaults: AcademiaDefaults }) {
  const [state, action, pending] = useActionState(saveAcademiaSetup, initialState);

  return (
    <form action={action} className="mt-8 grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>Full name *
          <input name="full_name" required maxLength={100} defaultValue={defaults.full_name ?? ""} className={inputClass} autoComplete="name" />
        </label>
        <label className={labelClass}>Institution / university *
          <input name="institution" required maxLength={120} defaultValue={defaults.institution ?? ""} className={inputClass} placeholder="Nexvia Institute of Technology" />
        </label>
        <label className={labelClass}>Designation *
          <input name="designation" required maxLength={120} defaultValue={defaults.designation ?? ""} className={inputClass} placeholder="Assistant Professor" />
        </label>
        <label className={labelClass}>Department / specialization *
          <input name="department" required maxLength={120} defaultValue={defaults.department ?? ""} className={inputClass} placeholder="Computer Science" />
        </label>
        <label className={labelClass}>Highest qualification *
          <input name="qualification" required maxLength={120} defaultValue={defaults.qualification ?? ""} className={inputClass} placeholder="PhD, M.Tech, MBA" />
        </label>
        <label className={labelClass}>Years of experience *
          <input name="years_experience" required type="number" min={0} max={70} step={0.5} defaultValue={defaults.years_experience ?? 0} className={inputClass} />
        </label>
        <label className={labelClass}>Professional phone
          <input name="phone" maxLength={20} defaultValue={defaults.phone ?? ""} className={inputClass} autoComplete="tel" placeholder="+91 98765 43210" />
        </label>
        <label className={labelClass}>Work location
          <input name="location" maxLength={120} defaultValue={defaults.location ?? ""} className={inputClass} placeholder="Bengaluru, Karnataka" />
        </label>
        <label className={labelClass}>LinkedIn / professional profile
          <input name="linkedin_url" type="url" defaultValue={defaults.linkedin_url ?? ""} className={inputClass} placeholder="https://linkedin.com/in/..." />
        </label>
        <label className={labelClass}>Availability
          <select name="availability" defaultValue={defaults.availability ?? ""} className={inputClass}>
            <option value="">Select availability</option>
            <option value="immediate">Immediate</option>
            <option value="within_30_days">Within 30 days</option>
            <option value="within_90_days">Within 90 days</option>
            <option value="project_based">Project based</option>
          </select>
        </label>
      </div>

      <label className={labelClass}>Skill set *
        <input name="skills" required defaultValue={defaults.skills?.join(", ") ?? ""} className={inputClass} placeholder="Python, Research, Machine Learning, Curriculum Design" />
        <span className="mt-1 block text-xs font-normal text-slate-500">Separate skills with commas.</span>
      </label>

      <label className={labelClass}>Preferred industry collaboration
        <input name="collaboration_preferences" defaultValue={defaults.collaboration_preferences?.join(", ") ?? ""} className={inputClass} placeholder="Research, FDP, Consultancy, Guest lectures" />
      </label>

      <label className={labelClass}>Professional summary *
        <textarea name="professional_summary" required minLength={30} maxLength={1500} rows={5} defaultValue={defaults.professional_summary ?? ""} className={inputClass} placeholder="Summarize your expertise, teaching or research experience, and the industry outcomes you want to create." />
      </label>

      {state.error ? <p role="alert" className="rounded-xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{state.error}</p> : null}

      <button type="submit" disabled={pending} className="rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60">
        {pending ? "Saving professional profile..." : "Complete academia onboarding"}
      </button>
    </form>
  );
}
