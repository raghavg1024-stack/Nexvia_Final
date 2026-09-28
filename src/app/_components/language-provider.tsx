"use client";

import { createContext, useContext, useEffect, useMemo, useState, useTransition } from "react";
import { Languages } from "lucide-react";
import { localeNames, translations, type AppLocale, type TranslationKey } from "@/lib/i18n";
import { saveLanguagePreference } from "./language-actions";

type LanguageContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children, initialLocale }: { children: React.ReactNode; initialLocale: AppLocale }) {
  const [locale, setLocaleState] = useState<AppLocale>(initialLocale);
  const [, startTransition] = useTransition();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<LanguageContextValue>(() => ({
    locale,
    setLocale(nextLocale) {
      setLocaleState(nextLocale);
      localStorage.setItem("nexvia-locale", nextLocale);
      startTransition(() => saveLanguagePreference(nextLocale));
    },
    t(key) {
      return translations[locale][key];
    },
  }), [locale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <label className="flex items-center gap-2 rounded-xl border border-line bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-sm">
      <Languages className="h-4 w-4 text-accent" aria-hidden="true" />
      <span className="sr-only">{t("language")}</span>
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value as AppLocale)}
        className="bg-transparent text-xs font-semibold text-foreground outline-none"
        aria-label={t("language")}
      >
        {(Object.keys(localeNames) as AppLocale[]).map((key) => <option key={key} value={key}>{localeNames[key]}</option>)}
      </select>
    </label>
  );
}
