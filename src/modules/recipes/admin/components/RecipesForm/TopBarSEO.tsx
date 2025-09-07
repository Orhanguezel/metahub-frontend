"use client";
import React from "react";
import { TopBar, LangGroup, LangBtn, SEOBox, Primary } from "../styled";
import type { SupportedLocale } from "@/types/recipes/common";
import type { TL } from "@/modules/recipes/types";
import { getTLStrict, getTL } from "@/i18n/recipes/getUILang";
import { slugifyLite } from "@/modules/recipes/utils/utils";

type Props = {
  t: (k: string, d?: string) => string;
  SUPPORTED_LOCALES: readonly SupportedLocale[];
  editLang: SupportedLocale;
  setEditLang: (l: SupportedLocale) => void;
  title: TL;
  description: TL;
  slugMap: TL;
  slugCanonical: string;
  canonicalTitle: string;
  onOpenAI?: () => void; // ✅ opsiyonel yapıldı
};

export default function TopBarSEO({
  t, SUPPORTED_LOCALES, editLang, setEditLang,
  title, description, slugMap, slugCanonical, canonicalTitle,
  onOpenAI
}: Props) {
  const localizedSlug = getTLStrict(slugMap as any, editLang);
  const path = (localizedSlug || slugCanonical || slugifyLite(canonicalTitle || "tarif")).trim();
  const desc = getTL(description as any, editLang) || t("desc_ph", "Kısa açıklama…");

  const handleOpenAI = onOpenAI ?? (() => {}); // ✅ no-op fallback

  return (
    <TopBar>
      <LangGroup role="group" aria-label={t("language", "Language")}>
        {SUPPORTED_LOCALES.map((l) => (
          <LangBtn key={l} type="button" aria-pressed={editLang === l} $active={editLang === l} onClick={() => setEditLang(l)} title={l}>
            {l.toUpperCase()}
          </LangBtn>
        ))}
      </LangGroup>

      <SEOBox aria-label="SEO preview">
        <div className="row1">
          <span className="host">tarifintarifi.com</span>
          <span className="path">{`/tarifler/${path}`}</span>
        </div>
        <div className="row2">{getTLStrict(title as any, editLang) || canonicalTitle || t("recipe", "Tarif")}</div>
        <div className="row3">{desc.slice(0, 140)}</div>
      </SEOBox>

      <div style={{ marginInlineStart: "auto" }}>
        <Primary type="button" onClick={handleOpenAI}>🤖 {t("ai.create_with_ai", "AI ile oluştur")}</Primary>
      </div>
    </TopBar>
  );
}
