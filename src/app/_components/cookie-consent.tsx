"use client";

import { useSyncExternalStore } from "react";

export const consentKey = "nexvia-cookie-consent";

function subscribe(callback: () => void) {
  window.addEventListener("nexvia-consent", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("nexvia-consent", callback);
    window.removeEventListener("storage", callback);
  };
}

export function CookieConsent() {
  const consent = useSyncExternalStore(subscribe, () => localStorage.getItem(consentKey), () => "loading");

  function choose(value: "accepted" | "essential") {
    localStorage.setItem(consentKey, value);
    window.dispatchEvent(new CustomEvent("nexvia-consent", { detail: value }));
  }

  if (consent !== null) return null;
  return (
    <section aria-label="Cookie preferences" className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-2xl backdrop-blur-xl">
      <h2 className="font-semibold text-white">Your privacy choices</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">Nexvia uses essential storage to keep the site working. With your permission, privacy-friendly analytics help us improve the experience.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => choose("accepted")} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600">Accept analytics</button>
        <button type="button" onClick={() => choose("essential")} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/5">Essential only</button>
      </div>
    </section>
  );
}
