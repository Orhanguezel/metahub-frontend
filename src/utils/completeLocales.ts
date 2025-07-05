// src/utils/completeLocales.ts
import { SUPPORTED_LOCALES } from "@/i18n";

export const completeLocales = (
  value: Record<string, string> = {},
  fallback: string = ""
): Record<string, string> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;

  const filled = SUPPORTED_LOCALES.filter((l) => value[l] && value[l].trim());
  const primary = filled.includes("en") ? "en" : filled[0];

  if (!primary) {
    return Object.fromEntries(SUPPORTED_LOCALES.map((l) => [l, ""])) as Record<
      string,
      string
    >;
  }

  return SUPPORTED_LOCALES.reduce<Record<string, string>>(
    (acc, lang) => ({
      ...acc,
      [lang]: value[lang] && value[lang].trim() ? value[lang] : value[primary],
    }),
    { ...value }
  );
};
