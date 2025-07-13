// src/hooks/useI18nNamespace.ts
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

export function useI18nNamespace(namespace: string, translations: Record<string, any>) {
  Object.entries(translations).forEach(([lang, resources]) => {
    const nsResources = resources[namespace] || resources;
    if (!i18n.hasResourceBundle(lang, namespace)) {
      i18n.addResourceBundle(lang, namespace, nsResources, true, true);
    }
  });
  return useTranslation(namespace);
}
