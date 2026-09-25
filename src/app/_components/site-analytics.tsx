"use client";

import { Analytics } from "@vercel/analytics/next";
import { useSyncExternalStore } from "react";
import { consentKey } from "./cookie-consent";

export function SiteAnalytics() {
  const consent = useSyncExternalStore(
    (callback) => {
      window.addEventListener("nexvia-consent", callback);
      window.addEventListener("storage", callback);
      return () => {
        window.removeEventListener("nexvia-consent", callback);
        window.removeEventListener("storage", callback);
      };
    },
    () => localStorage.getItem(consentKey),
    () => null,
  );
  return consent === "accepted" ? <Analytics /> : null;
}
