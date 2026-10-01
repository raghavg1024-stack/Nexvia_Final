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
    <section aria-label="Cookie preferences" className="premium-card fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-xl p-5">
      <h2 className="font-semibold text-foreground">Your privacy choices</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">Nexvia uses essential storage to keep the site working. With your permission, privacy-friendly analytics help us improve the experience.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => choose("accepted")} className="premium-button text-sm">Accept analytics</button>
        <button type="button" onClick={() => choose("essential")} className="premium-button-secondary text-sm">Essential only</button>
      </div>
    </section>
  );
}
