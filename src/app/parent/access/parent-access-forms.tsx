"use client";

import { useActionState, useState } from "react";
import {
  createParentInvite,
  redeemParentInvite,
  type ParentActionState,
} from "@/lib/parent";

const initialState: ParentActionState = { ok: false };

export function ParentAccessForms() {
  const [redeemState, redeemAction, redeemPending] = useActionState(
    redeemParentInvite,
    initialState,
  );
  const [inviteState, inviteAction, invitePending] = useActionState(
    createParentInvite,
    initialState,
  );
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    if (!inviteState.code) return;
    await navigator.clipboard.writeText(inviteState.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-line bg-card p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          For parents and guardians
        </p>
        <h2 className="mt-2 font-display text-xl uppercase tracking-tight text-foreground">
          Link a learner
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Enter the private code created from the learner&apos;s signed-in account.
        </p>

        <form action={redeemAction} className="mt-5 space-y-4">
          <div>
            <label htmlFor="parent-code" className="text-sm font-medium text-foreground">
              One-time access code
            </label>
            <input
              id="parent-code"
              name="code"
              autoComplete="off"
              inputMode="text"
              placeholder="XXXXX-XXXXX"
              required
              maxLength={11}
              className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-mono text-sm uppercase tracking-[0.18em] text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <div>
            <label htmlFor="relationship" className="text-sm font-medium text-foreground">
              Your relationship
            </label>
            <select
              id="relationship"
              name="relationship"
              defaultValue="Parent"
              className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            >
              <option>Parent</option>
              <option>Guardian</option>
              <option>Caregiver</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={redeemPending}
            className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {redeemPending ? "Linking learner..." : "Link learner"}
          </button>
        </form>
        {redeemState.message && (
          <p
            role="status"
            className={`mt-4 text-sm ${redeemState.ok ? "text-emerald-500" : "text-red-500"}`}
          >
            {redeemState.message}
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-card p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-500">
          For learners
        </p>
        <h2 className="mt-2 font-display text-xl uppercase tracking-tight text-foreground">
          Invite a parent
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Generate a one-time code and share it privately. The code expires after seven days.
        </p>

        <form action={inviteAction} className="mt-5">
          <label className="mb-4 flex items-start gap-3 rounded-xl border border-line bg-background p-3 text-xs leading-5 text-slate-400">
            <input type="checkbox" name="allowOverdueCalls" className="mt-1 accent-violet-400" />
            I allow the linked parent to opt in to one supportive automated call when my active roadmap task becomes overdue.
          </label>
          <button
            type="submit"
            disabled={invitePending}
            className="w-full rounded-xl border border-accent/40 bg-accent-soft px-4 py-3 text-sm font-semibold text-accent transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {invitePending ? "Creating code..." : "Create parent code"}
          </button>
        </form>

        {inviteState.code && (
          <div className="mt-4 rounded-xl border border-accent/30 bg-background p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Private access code</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <strong className="font-mono text-xl tracking-[0.16em] text-foreground">
                {inviteState.code}
              </strong>
              <button
                type="button"
                onClick={copyCode}
                className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-foreground transition hover:border-accent hover:text-accent"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}
        {inviteState.message && (
          <p
            role="status"
            className={`mt-4 text-sm ${inviteState.ok ? "text-emerald-500" : "text-red-500"}`}
          >
            {inviteState.message}
          </p>
        )}
      </section>
    </div>
  );
}
