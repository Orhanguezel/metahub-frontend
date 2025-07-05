// src/hooks/useI18nNamespace.ts
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

export function useI18nNamespace(namespace: string, translations: any) {
  Object.entries(translations).forEach(([lang, resources]) => {
    if (!i18n.hasResourceBundle(lang, namespace)) {
      i18n.addResourceBundle(lang, namespace, resources, true, true);
    }
  });
  return useTranslation(namespace);
}
