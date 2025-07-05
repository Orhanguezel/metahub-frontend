"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// --- Desteklenen diller ---
export const SUPPORTED_LOCALES = ["en", "de", "tr", "fr", "es", "pl"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

// --- i18n initialization ---
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: "en", // default
    fallbackLng: "en",
    ns: [], // Namespace'ler otomatik belirlenir
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
