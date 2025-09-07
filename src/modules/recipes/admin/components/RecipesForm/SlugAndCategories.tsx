"use client";
import React, { useMemo, useRef, useState, useEffect } from "react";
import styled from "styled-components";
import { Col, Label, Input, SmallRow, Small, Help, TagRow, TagChip, Primary } from "../styled";
import { useSelector } from "react-redux";
import { getMultiLang } from "@/types/recipes/common";
import type { RecipeCategory } from "@/modules/recipes/types";
import type { SupportedLocale } from "@/types/recipes/common";
import type { TL } from "@/modules/recipes/types";
import { getTLStrict, setTL } from "@/i18n/recipes/getUILang";

const useCategoriesFromStore = (): RecipeCategory[] => {
  return useSelector((s: any) =>
    (s.recipesCategory?.categories) || // ← normalize edilmiş slice
    (s.recipeCategory?.categories) ||
    (s.recipeCategories?.list) ||
    (s.categories?.list) ||
    []
  );
};

type Props = {
  t: (k: string, d?: string) => string;
  editLang: SupportedLocale;
  slugMap: TL;
  setSlugMap: (v: TL) => void;
  slugCanonical: string;
  setSlugCanonical: (v: string) => void;
  autoSlug: boolean;
  setAutoSlug: (v: boolean) => void;
  categoryIds: string[];
  setCategoryIds: (ids: string[]) => void;
  onAddCategory: () => void;
};

export default function SlugAndCategories({
  t, editLang, slugMap, setSlugMap, slugCanonical, setSlugCanonical,
  autoSlug, setAutoSlug, categoryIds, setCategoryIds, onAddCategory
}: Props) {
  const storeCategories = useCategoriesFromStore();
  const categoryOptions = useMemo(
    () => (storeCategories || []).map((c) => ({
      id: c._id,
      label: getMultiLang(c.name as any, editLang) || c.slug || String(c._id),
    })), [storeCategories, editLang]
  );

  const [catOpen, setCatOpen] = useState(false);
  const [catQuery, setCatQuery] = useState("");
  const catRef = useRef<HTMLDivElement>(null);

  const filteredCategories = useMemo(() => {
    const q = catQuery.trim().toLowerCase();
    if (!q) return categoryOptions;
    return categoryOptions.filter((o) => o.label.toLowerCase().includes(q));
  }, [categoryOptions, catQuery]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (!catOpen) return; if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false); };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setCatOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onEsc); };
  }, [catOpen]);

  const toggleCat = (id: string) => setCategoryIds(categoryIds.includes(id) ? categoryIds.filter(x=>x!==id) : [...categoryIds, id]);
  const selectAll = () => setCategoryIds(categoryOptions.map((o) => o.id));
  const clearAll = () => setCategoryIds([]);

  const localizedSlug = getTLStrict(slugMap as any, editLang) ?? "";

  return (
    <>
      <Col>
        <Label>{t("slug", "Slug")} ({editLang.toUpperCase()})</Label>
        <Input value={localizedSlug} onChange={(e)=>setSlugMap(setTL(slugMap as any, editLang, e.target.value) as any)} placeholder={t("slug_ph", "ornek-slug")}/>
        <SmallRow>
          <small>
            <input id="autoslug" type="checkbox" checked={autoSlug} onChange={(e)=>setAutoSlug(e.target.checked)}/> {" "}
            <label htmlFor="autoslug">{t("auto_from_title", "Başlıktan otomatik üret (boşsa)")}</label>
          </small>
        </SmallRow>
        <SmallRow>
          <Label style={{ marginTop: 6 }}>{t("slug_canonical", "Slug (canonical)")}</Label>
          <Input value={slugCanonical} onChange={(e)=>setSlugCanonical(e.target.value)} placeholder="pepper-onion-garlic-recipe"/>
        </SmallRow>
      </Col>

      <Col>
        <Label>{t("categories", "Categories")}</Label>
        <CatDropdown ref={catRef}>
          <CatButton type="button" aria-haspopup="listbox" aria-expanded={catOpen} onClick={()=>setCatOpen(v=>!v)}
            title={categoryIds.map(id => categoryOptions.find(o=>o.id===id)?.label).filter(Boolean).join(", ") || t("select_categories", "Kategori seç")}>
            <span className="text">
              {categoryIds.length ? `${categoryIds.length} ${t("selected","seçili")}` : t("select_categories","Kategori seç")}
            </span>
            <span className="chev" aria-hidden>▾</span>
          </CatButton>

          {catOpen && (
            <CatMenu role="listbox" aria-multiselectable>
              <div className="head"><Input placeholder={t("search","Ara…")} value={catQuery} onChange={(e)=>setCatQuery(e.target.value)} /></div>
              <CatList>
                {filteredCategories.length===0 && <EmptyItem>{t("empty","Sonuç yok")}</EmptyItem>}
                {filteredCategories.map((o)=> {
                  const checked = categoryIds.includes(o.id);
                  return (
                    <CatItem key={o.id} $checked={checked} onClick={()=>toggleCat(o.id)} role="option" aria-selected={checked}>
                      <input type="checkbox" tabIndex={-1} readOnly checked={checked} />
                      <span className="label" title={o.label}>{o.label}</span>
                    </CatItem>
                  );
                })}
              </CatList>
              <CatFoot>
                <Small type="button" onClick={selectAll}>{t("all","Tümü")}</Small>
                <Small type="button" onClick={clearAll}>{t("clear","Temizle")}</Small>
                <Primary type="button" onClick={()=>setCatOpen(false)}>{t("done","Tamam")}</Primary>
              </CatFoot>
            </CatMenu>
          )}
        </CatDropdown>

        {!!categoryIds.length && (
          <TagRow style={{ marginTop: 6 }}>
            {categoryIds.map((id) => {
              const label = categoryOptions.find(o=>o.id===id)?.label || id;
              return <TagChip key={id} onClick={()=>toggleCat(id)}>{label} <span aria-hidden>×</span></TagChip>;
            })}
          </TagRow>
        )}

        <Small type="button" onClick={onAddCategory} style={{ marginTop: 6 }}>
          + {t("newCategory", "New Category")}
        </Small>
        <Help>{t("category_help", "Seçilen kategoriler kayıtta tarife atanır.")}</Help>
      </Col>
    </>
  );
}

/* ==== Kategori dropdown stilleri ==== */
const CatDropdown = styled.div`position: relative; display: inline-block; width: 100%;`;
const CatButton = styled.button`
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  gap: ${({ theme }) => theme.spacings.xs};
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  cursor: pointer;
  &:hover { background: ${({ theme }) => theme.colors.inputBackgroundFocus}; }
  .text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .chev { opacity: .7; }
`;
const CatMenu = styled.div`
  position: absolute; inset-inline-start: 0; top: calc(100% + 6px);
  z-index: ${({ theme }) => theme.zIndex.dropdown};
  width: min(520px, 100%);
  background: ${({ theme }) => theme.colors.cardBackground};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  display: grid; grid-template-rows: auto minmax(120px, 280px) auto;
  overflow: hidden;
  .head { padding: 8px; border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright}; }
`;
const CatList = styled.div`max-height: 280px; overflow: auto;`;
const CatItem = styled.button<{ $checked?: boolean }>`
  width: 100%; display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; text-align: left; cursor: pointer;
  background: ${({ theme, $checked }) => $checked ? theme.colors.primaryTransparent : "transparent"};
  border: 0; border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
  color: ${({ theme }) => theme.colors.text};
  &:hover { background: ${({ theme }) => theme.colors.inputBackgroundLight}; }
  input { pointer-events: none; }
  .label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
`;
const EmptyItem = styled.div`padding: 12px; color: ${({ theme }) => theme.colors.textSecondary};`;
const CatFoot = styled.div`
  display: flex; align-items: center; gap: ${({ theme }) => theme.spacings.xs};
  justify-content: flex-end; padding: 8px;
  border-top: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
`;
