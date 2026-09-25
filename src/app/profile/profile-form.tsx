"use client";

import { useActionState } from "react";
import { updateProfile } from "./actions";
import type { Profile } from "@/lib/types";

const initialState = { error: null as string | null };

const inputClass =
  "mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-foreground placeholder-slate-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";
const labelClass = "block text-sm font-medium text-slate-400";

export default function ProfileEditForm({ profile }: { profile: Profile | null }) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);

  return (
    <form
      action={formAction}
      className="rounded-2xl bg-card p-6 ring-1 ring-line"
    >
      <h2 className="font-display text-lg uppercase tracking-tight text-foreground">
        Edit profile
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="full_name" className={labelClass}>
            Full name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            defaultValue={profile?.full_name ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={profile?.email ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="education_level" className={labelClass}>
            Education level
          </label>
          <select
            id="education_level"
            name="education_level"
            defaultValue={profile?.education_level ?? ""}
            className={inputClass}
          >
            <option value="">Not set</option>
            <option value="undergraduate">Undergraduate</option>
            <option value="graduate">Graduate</option>
            <option value="self_taught">Self taught</option>
          </select>
        </div>
        <div>
          <label htmlFor="learning_style" className={labelClass}>
            Learning style
          </label>
          <select
            id="learning_style"
            name="learning_style"
            defaultValue={profile?.learning_style ?? ""}
            className={inputClass}
          >
            <option value="">Not set</option>
            <option value="visual">Visual</option>
            <option value="auditory">Auditory</option>
            <option value="reading">Reading</option>
            <option value="kinesthetic">Kinesthetic</option>
          </select>
        </div>
        <div>
          <label htmlFor="study_hours_per_week" className={labelClass}>
            Study hours per week
          </label>
          <input
            id="study_hours_per_week"
            name="study_hours_per_week"
            type="number"
            min={0}
            max={168}
            defaultValue={profile?.study_hours_per_week ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="cgpa" className={labelClass}>
            CGPA (e.g. 3.5)
          </label>
          <input
            id="cgpa"
            name="cgpa"
            type="number"
            step="0.01"
            min={0}
            max={10}
            defaultValue={profile?.cgpa ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="current_percentage" className={labelClass}>
            Current marks (%)
          </label>
          <input id="current_percentage" name="current_percentage" type="number" step="0.1" min={0} max={100} defaultValue={profile?.current_percentage ?? ""} className={inputClass} placeholder="e.g. 82" />
        </div>
        <div>
          <label htmlFor="tenth_percentage" className={labelClass}>10th marks (%)</label>
          <input id="tenth_percentage" name="tenth_percentage" type="number" step="0.1" min={0} max={100} defaultValue={profile?.tenth_percentage ?? ""} className={inputClass} />
        </div>
        <div>
          <label htmlFor="twelfth_percentage" className={labelClass}>12th marks (%)</label>
          <input id="twelfth_percentage" name="twelfth_percentage" type="number" step="0.1" min={0} max={100} defaultValue={profile?.twelfth_percentage ?? ""} className={inputClass} />
        </div>
        <div>
          <label htmlFor="major" className={labelClass}>
            Major / Field of Study
          </label>
          <input
            id="major"
            name="major"
            type="text"
            defaultValue={profile?.major ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="graduation_year" className={labelClass}>
            Graduation Year
          </label>
          <input
            id="graduation_year"
            name="graduation_year"
            type="number"
            min={2000}
            max={2100}
            defaultValue={profile?.graduation_year ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="gender" className={labelClass}>Gender (for scholarship eligibility)</label>
          <select id="gender" name="gender" defaultValue={profile?.gender ?? ""} className={inputClass}>
            <option value="">Prefer not to say / Not set</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="social_category" className={labelClass}>Social category</label>
          <select id="social_category" name="social_category" defaultValue={profile?.social_category ?? ""} className={inputClass}>
            <option value="">Not set</option>
            <option value="General">General</option>
            <option value="OBC">OBC</option>
            <option value="EBC">EBC</option>
            <option value="DNT">DNT</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
          </select>
        </div>
        <div>
          <label htmlFor="annual_family_income" className={labelClass}>Annual family income (₹)</label>
          <input id="annual_family_income" name="annual_family_income" type="number" min={0} step={1000} defaultValue={profile?.annual_family_income ?? ""} className={inputClass} />
        </div>
        <div>
          <label htmlFor="disability_percentage" className={labelClass}>Disability percentage (if applicable)</label>
          <input id="disability_percentage" name="disability_percentage" type="number" min={0} max={100} step="0.1" defaultValue={profile?.disability_percentage ?? ""} className={inputClass} />
        </div>
        <div>
          <label htmlFor="domicile_state" className={labelClass}>Domicile state / UT</label>
          <input id="domicile_state" name="domicile_state" type="text" maxLength={80} defaultValue={profile?.domicile_state ?? ""} className={inputClass} placeholder="e.g. Karnataka" />
        </div>
      </div>
      <div className="mt-4">
        <label htmlFor="skill_tags" className={labelClass}>Skills for matching</label>
        <input id="skill_tags" name="skill_tags" type="text" defaultValue={profile?.skill_tags?.join(", ") ?? ""} className={inputClass} placeholder="Python, Pandas, Machine Learning" />
        <p className="mt-1 text-xs text-slate-500">Separate skills with commas so Nexvia can match you accurately.</p>
      </div>
      <label className="mt-4 flex items-start gap-3 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.04] p-3 text-sm text-slate-300">
        <input type="checkbox" name="open_to_recruiters" defaultChecked={profile?.open_to_recruiters ?? false} className="mt-0.5 h-4 w-4 accent-cyan-400" />
        <span><span className="font-semibold text-cyan-200">Open to recruiter matching</span><span className="mt-0.5 block text-xs text-slate-500">Share only your name, skills, marks and CGPA with verified recruiters.</span></span>
      </label>
      <div className="mt-4">
        <label htmlFor="goals" className={labelClass}>
          Goals
        </label>
        <textarea
          id="goals"
          name="goals"
          rows={4}
          defaultValue={profile?.goals ?? ""}
          className={inputClass}
        />
      </div>
      {state?.error && (
        <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </div>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-6 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
