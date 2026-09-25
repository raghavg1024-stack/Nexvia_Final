"use client";

import { useActionState } from "react";
import { joinWaitlist, sendContactMessage, submitReview, type FormState } from "../actions";

const initialState: FormState = {};
const fieldClass = "w-full rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400";

function Status({ error, pending }: { error?: string; pending: boolean }) {
  return <>{error && <p role="alert" className="text-sm text-rose-300">{error}</p>}<button disabled={pending} className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-3 font-bold text-white disabled:opacity-60">{pending ? "Sending…" : "Submit"}</button></>;
}

export function WaitlistForm() {
  const [state, action, pending] = useActionState(joinWaitlist, initialState);
  return <form action={action} className="space-y-4"><input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" /><label className="block text-sm">Full name<input required name="full_name" autoComplete="name" placeholder="e.g. Aarav Sharma" className={`${fieldClass} mt-2`} /></label><label className="block text-sm">Email<input required type="email" name="email" autoComplete="email" placeholder="you@example.com" className={`${fieldClass} mt-2`} /></label><label className="block text-sm">I am a<select required name="role" className={`${fieldClass} mt-2`} defaultValue="student"><option className="bg-slate-950" value="student">Student</option><option className="bg-slate-950" value="parent">Parent</option><option className="bg-slate-950" value="academia">Academic partner</option><option className="bg-slate-950" value="industry">Industry partner</option><option className="bg-slate-950" value="other">Other</option></select></label><label className="flex gap-3 text-sm text-slate-400"><input required type="checkbox" name="consent" className="mt-1" /> I agree to be contacted about Nexvia access.</label><Status error={state.error} pending={pending} /></form>;
}

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContactMessage, initialState);
  return <form action={action} className="space-y-4"><input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" /><label className="block text-sm">Name<input required name="name" autoComplete="name" placeholder="Your full name" className={`${fieldClass} mt-2`} /></label><label className="block text-sm">Email<input required type="email" name="email" autoComplete="email" placeholder="you@example.com" className={`${fieldClass} mt-2`} /></label><label className="block text-sm">Subject<input required name="subject" placeholder="e.g. College pilot" className={`${fieldClass} mt-2`} /></label><label className="block text-sm">Message<textarea required name="message" rows={6} placeholder="Tell us what you want to achieve with Nexvia…" className={`${fieldClass} mt-2 resize-y`} /></label><Status error={state.error} pending={pending} /></form>;
}

export function ReviewForm() {
  const [state, action, pending] = useActionState(submitReview, initialState);
  return <form action={action} className="space-y-4"><input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" /><label className="block text-sm">Your name<input required name="reviewer_name" className={`${fieldClass} mt-2`} /></label><label className="block text-sm">Your role<input required name="reviewer_role" placeholder="Student, faculty member, recruiter…" className={`${fieldClass} mt-2`} /></label><label className="block text-sm">Rating<select required name="rating" defaultValue="5" className={`${fieldClass} mt-2`}><option className="bg-slate-950" value="5">5 — Excellent</option><option className="bg-slate-950" value="4">4 — Very good</option><option className="bg-slate-950" value="3">3 — Good</option><option className="bg-slate-950" value="2">2 — Fair</option><option className="bg-slate-950" value="1">1 — Poor</option></select></label><label className="block text-sm">Your experience<textarea required name="review" minLength={20} rows={5} className={`${fieldClass} mt-2 resize-y`} /></label><p className="text-xs text-slate-500">Reviews are linked to signed-in users and published only after moderation.</p><Status error={state.error} pending={pending} /></form>;
}
