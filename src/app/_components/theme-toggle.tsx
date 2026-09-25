"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const themeKey = "nexvia-theme";
const themeEvent = "nexvia-theme-change";

function subscribe(callback: () => void) {
  window.addEventListener(themeEvent, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(themeEvent, callback);
    window.removeEventListener("storage", callback);
  };
}

function getTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem(themeKey, theme);
  window.dispatchEvent(new CustomEvent(themeEvent, { detail: theme }));
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "light");

  return (
    <div
      className="fixed bottom-4 right-4 z-[90] flex items-center gap-1 rounded-full border border-line bg-card/95 p-1.5 shadow-[0_12px_35px_rgba(15,23,42,.2)] backdrop-blur-xl"
      role="group"
      aria-label="Choose colour theme"
    >
      <button
        type="button"
        onClick={() => applyTheme("light")}
        aria-pressed={theme === "light"}
        className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold transition ${theme === "light" ? "theme-choice-active" : "text-slate-500 hover:bg-accent-soft hover:text-accent"}`}
      >
        <Sun className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Light</span>
      </button>
      <button
        type="button"
        onClick={() => applyTheme("dark")}
        aria-pressed={theme === "dark"}
        className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold transition ${theme === "dark" ? "theme-choice-active" : "text-slate-500 hover:bg-accent-soft hover:text-accent"}`}
      >
        <Moon className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Dark</span>
      </button>
    </div>
  );
}
