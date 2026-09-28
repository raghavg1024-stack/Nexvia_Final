"use client";

import { createContext, useContext, useEffect, useMemo, useState, useTransition } from "react";
import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { localeNames, translations, type AppLocale, type TranslationKey } from "@/lib/i18n";
import { saveLanguagePreference } from "./language-actions";

type LanguageContextValue = {
  locale: AppLocale;
  pending: boolean;
  status: string;
  setLocale: (locale: AppLocale) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children, initialLocale }: { children: React.ReactNode; initialLocale: AppLocale }) {
  const [locale, setLocaleState] = useState<AppLocale>(initialLocale);
  const [status, setStatus] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    let active = true;
    const applySavedLocale = () => {
      const saved = localStorage.getItem("nexvia-locale");
      if (active && (saved === "en" || saved === "hi" || saved === "mr")) setLocaleState(saved);
    };
    window.addEventListener("storage", applySavedLocale);
    queueMicrotask(applySavedLocale);
    return () => {
      active = false;
      window.removeEventListener("storage", applySavedLocale);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<LanguageContextValue>(() => ({
    locale,
    pending,
    status,
    setLocale(nextLocale) {
      setLocaleState(nextLocale);
      localStorage.setItem("nexvia-locale", nextLocale);
      setStatus(`${translations[nextLocale].languageApplied}: ${localeNames[nextLocale]}`);
      startTransition(async () => {
        await saveLanguagePreference(nextLocale);
        router.refresh();
      });
    },
    t(key) {
      return translations[locale][key];
    },
  }), [locale, pending, router, status]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}

export function LanguageSwitcher() {
  const { locale, pending, setLocale, status, t } = useLanguage();

  return (
    <div className="relative">
      <label className="flex items-center gap-2 rounded-xl border border-line bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-sm">
        <Languages className="h-4 w-4 text-accent" aria-hidden="true" />
        <span className="sr-only">{t("language")}</span>
        <select
          value={locale}
          onChange={(event) => setLocale(event.target.value as AppLocale)}
          className="min-w-20 bg-transparent text-xs font-semibold text-foreground outline-none"
          aria-label={t("language")}
          disabled={pending}
        >
          {(Object.keys(localeNames) as AppLocale[]).map((key) => (
            <option key={key} value={key} className="bg-card text-foreground">{localeNames[key]}</option>
          ))}
        </select>
      </label>
      <span className="sr-only" aria-live="polite">{status}</span>
    </div>
  );
}
