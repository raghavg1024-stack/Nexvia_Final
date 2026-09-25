"use client";

import { useActionState } from "react";
import { createGroup, type CommunityFormState } from "@/lib/community";

const initialState: CommunityFormState = { ok: false, message: "" };

const inputClass =
  "mt-1 w-full rounded-xl border border-line bg-card px-4 py-2 text-sm text-foreground placeholder:text-slate-400 focus:border-accent focus:outline-none";

export function CreateGroupForm() {
  const [state, formAction, pending] = useActionState(createGroup, initialState);

  return (
    <section className="rounded-xl border border-line bg-card p-6">
      <h2 className="font-display text-lg uppercase tracking-tight text-foreground">
        Create a study group
      </h2>
      <form action={formAction} className="mt-4 space-y-4">
        <div>
          <label
            htmlFor="group-name"
            className="block text-sm font-medium text-slate-400"
          >
            Group name
          </label>
          <input
            id="group-name"
            name="name"
            required
            maxLength={60}
            placeholder="e.g. Frontend Interview Prep"
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="group-description"
            className="block text-sm font-medium text-slate-400"
          >
            Description
          </label>
          <textarea
            id="group-description"
            name="description"
            maxLength={200}
            rows={3}
            placeholder="What is this group about?"
            className={`${inputClass} resize-none`}
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Creating..." : "Create group"}
        </button>
        {state.message && (
          <p
            aria-live="polite"
            className={`text-sm ${state.ok ? "text-emerald-600" : "text-amber-600"}`}
          >
            {state.message}
          </p>
        )}
      </form>
    </section>
  );
}