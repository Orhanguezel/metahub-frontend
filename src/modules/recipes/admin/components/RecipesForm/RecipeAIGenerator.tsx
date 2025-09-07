"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store";

import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/recipes/locales";

import type { SupportedLocale } from "@/types/recipes/common";
import { SUPPORTED_LOCALES, getMultiLang } from "@/types/recipes/common";

import type { AIGeneratorProps, AiGenInput } from "@/modules/recipes/types";
import type { RecipeCategory } from "@/modules/recipes/types";

import {
  AiCard, AiHead, AiGrid, AiChecks, AiFoot, Toggle, Note,
  Label, Select, Input, TextArea, Small, Primary,
  Field, FieldWide, TagRow, TagChip, TagInputBox, Help,
  PromptChips, PromptChip, Divider, SectionTitle
} from "../styled";

import { generateRecipePublic, updateRecipeAdmin } from "@/modules/recipes/slice/recipeSlice";
import { getUILang } from "@/i18n/recipes/getUILang";

/* ===== helpers ===== */
const addToken = (raw: string) =>
  raw.split(/[,;\n]/g).map((s) => s.trim()).filter(Boolean);

const useCategoriesFromStore = (): RecipeCategory[] =>
  useSelector((s: any) => s.recipesCategory?.categories || []);

export default function RecipeAIGenerator({
  defaultLang = "tr" as SupportedLocale,
  compact = false,
  onGenerated,
}: AIGeneratorProps<SupportedLocale>) {
  const dispatch = useDispatch<AppDispatch>();
  const { i18n, t } = useI18nNamespace("recipes", translations);
  const uiLang = useMemo<SupportedLocale>(() => getUILang(i18n?.language), [i18n?.language]);

  const categories: RecipeCategory[] = useCategoriesFromStore();

  const [open, setOpen] = useState(true);
  const [mode, setMode] = useState<"replace" | "merge">("replace");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [input, setInput] = useState<AiGenInput<SupportedLocale>>({
    lang: defaultLang,
    cuisine: "",
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    lactoseFree: false,
    servings: undefined,
    maxMinutes: undefined,
    includeIngredients: [],
    excludeIngredients: [],
    prompt: "",
  });

  // kategori çoklu seçim (dropdown)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [catOpen, setCatOpen] = useState(false);
  const [catQuery, setCatQuery] = useState("");
  const ddRef = useRef<HTMLDivElement>(null);

  // chip-tabanlı include/exclude
  const [incl, setIncl] = useState<string[]>([]);
  const [excl, setExcl] = useState<string[]>([]);
  const [inclDraft, setInclDraft] = useState("");
  const [exclDraft, setExclDraft] = useState(""); // ✅ yazım hatası düzeltildi

  useEffect(() => {
    setInput((s) => ({ ...s, includeIngredients: incl, excludeIngredients: excl }));
  }, [incl, excl]);

  // kategori label’ları (çok dilli)
  const categoryOptions = useMemo(
    () =>
      (categories || []).map((c) => ({
        id: c._id,
        label: getMultiLang(c.name as any, uiLang) || c.slug || c._id,
      })),
    [categories, uiLang]
  );

  // dropdown filtrelenmiş liste
  const filteredCategories = useMemo(() => {
    const q = catQuery.trim().toLowerCase();
    if (!q) return categoryOptions;
    return categoryOptions.filter((o) => o.label.toLowerCase().includes(q));
  }, [categoryOptions, catQuery]);

  const toggleCat = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const selectAll = () => setSelectedCategoryIds(categoryOptions.map((o) => o.id));
  const clearAll = () => setSelectedCategoryIds([]);

  // dropdown dış klik + Esc
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!catOpen) return;
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) setCatOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setCatOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [catOpen]);

  // hızlı prompt çipleri
  const presetPrompts = [
    t("ai.no_spicy", "acı olmasın"),
    t("ai.tomato_forward", "domates ağırlıklı"),
    t("ai.kid_friendly", "çocuk dostu"),
    t("ai.few_ingredients", "az malzemeli"),
    t("ai.no_oven", "fırınsız"),
    t("ai.pot", "tencerede"),
    t("ai.pan", "tavada"),
    t("ai.ready_15", "15 dakikada hazır"),
  ];
  const addPreset = (p: string) =>
    setInput((s) => ({ ...s, prompt: s.prompt ? `${s.prompt.trim()} • ${p}` : p }));

  const onInclKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const items = addToken(inclDraft);
      if (items.length) {
        setIncl((arr) => Array.from(new Set([...arr, ...items])));
        setInclDraft("");
      }
    }
  };
  const onExclKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const items = addToken(exclDraft);
      if (items.length) {
        setExcl((arr) => Array.from(new Set([...arr, ...items])));
        setExclDraft("");
      }
    }
  };
  const onInclPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    const items = addToken(pasted);
    if (items.length) {
      e.preventDefault();
      setIncl((arr) => Array.from(new Set([...arr, ...items])));
      setInclDraft("");
    }
  };
  const onExclPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    const items = addToken(pasted);
    if (items.length) {
      e.preventDefault();
      setExcl((arr) => Array.from(new Set([...arr, ...items])));
      setExclDraft("");
    }
  };

  const run = async () => {
    setErr(null); setOk(null); setLoading(true);

    const payload: AiGenInput<SupportedLocale> = {
      lang: input.lang,
      cuisine: input.cuisine || undefined,
      vegetarian: !!input.vegetarian,
      vegan: !!input.vegan,
      glutenFree: !!input.glutenFree,
      lactoseFree: !!input.lactoseFree,
      servings: input.servings ?? undefined,
      maxMinutes: input.maxMinutes ?? undefined,
      includeIngredients: input.includeIngredients || [],
      excludeIngredients: input.excludeIngredients || [],
      prompt: input.prompt || undefined,
    };

    try {
      const { data, message } = await (dispatch as AppDispatch)(generateRecipePublic(payload)).unwrap();

      // kategori seçildiyse oluşturulana patch
      let patched = data;
      if (selectedCategoryIds.length) {
        try {
          const upd = await (dispatch as AppDispatch)(
            updateRecipeAdmin({ id: data._id, input: { categories: selectedCategoryIds } })
          ).unwrap();
          patched = upd.data;
        } catch {/* admin değilse sessiz geç */ }
      }

      setOk(message || t("ai.generated_ok", "✅ Tarif üretildi ve kaydedildi"));
      onGenerated?.(patched, mode);
    } catch (e: any) {
      const m = typeof e === "string" ? e : (e?.message as string) || t("ai.generate_error", "Üretim sırasında hata oluştu.");
      setErr(m);
    } finally {
      setLoading(false);
    }
  };

  // ✅ daha açıklayıcı örnek (ana prompt alanı)
  const promptPH = useMemo(
    () =>
      t(
        "ai.prompt_ph_full",
        "Örn: “Türk mutfağında, 4 kişilik, 25 dk, acısız; domates-biber öne çıksın; fırın kullanılmasın; vegan olsun; malzemeler gram/adet; adımlar kısa ve numaralı; sonunda kalori ver.”"
      ),
    [t]
  );

  const selectedChips = useMemo(
    () =>
      selectedCategoryIds
        .map((id) => categoryOptions.find((o) => o.id === id))
        .filter(Boolean) as { id: string; label: string }[],
    [selectedCategoryIds, categoryOptions]
  );

  return (
    <AiCard>
      <AiHead onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <strong>🤖 {t("ai.create_with_ai", "AI ile oluştur")}</strong>
        <span aria-hidden>{open ? "−" : "+"}</span>
      </AiHead>

      {open && (
        <AiGrid data-compact={compact ? "1" : undefined}>
          <Field>
            <Label>{t("ai.output_lang", "Çıkış Dili")}</Label>
            <Select
              value={input.lang}
              onChange={(e) => setInput((s) => ({ ...s, lang: e.target.value as SupportedLocale }))}
            >
              {(SUPPORTED_LOCALES as readonly SupportedLocale[]).map((l) => (
                <option key={l} value={l}>{l.toUpperCase()}</option>
              ))}
            </Select>
          </Field>

          <Field>
            <Label>{t("ai.cuisine", "Mutfak")}</Label>
            <Input
              placeholder={t("ai.cuisine_ph", "italian, turkish…")}
              value={input.cuisine || ""}
              onChange={(e) => setInput((s) => ({ ...s, cuisine: e.target.value }))}
            />
            <Help>{t("ai.cuisine_help", "Tek bir mutfak yazman yeterli.")}</Help>
          </Field>

          <Field>
            <Label>{t("ai.servings", "Servis (kişi)")}</Label>
            <Input
              type="number" min={1} inputMode="numeric"
              placeholder="2"
              value={input.servings ?? ""}
              onChange={(e) => setInput((s) => ({ ...s, servings: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </Field>

          <Field>
            <Label>{t("ai.max_minutes", "Maks. Süre (dk)")}</Label>
            <Input
              type="number" min={1} inputMode="numeric"
              placeholder="20"
              value={input.maxMinutes ?? ""}
              onChange={(e) => setInput((s) => ({ ...s, maxMinutes: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </Field>

          <AiChecks aria-label={t("ai.dietary", "Beslenme Etiketleri")}>
            <label>
              <input
                type="checkbox"
                checked={!!input.vegetarian}
                onChange={(e) => setInput((s) => ({ ...s, vegetarian: e.target.checked }))}
              /> <span role="img" aria-label="vegetarian">🥦</span> {t("dietaryLabels.vegetarian", "Vejetaryen")}
            </label>
            <label>
              <input
                type="checkbox"
                checked={!!input.vegan}
                onChange={(e) => setInput((s) => ({ ...s, vegan: e.target.checked }))}
              /> <span role="img" aria-label="vegan">🌱</span> {t("dietaryLabels.vegan", "Vegan")}
            </label>
            <label>
              <input
                type="checkbox"
                checked={!!input.glutenFree}
                onChange={(e) => setInput((s) => ({ ...s, glutenFree: e.target.checked }))}
              /> <span role="img" aria-label="gluten-free">🚫🌾</span> {t("dietaryLabels.glutenFree", "Glütensiz")}
            </label>
            <label>
              <input
                type="checkbox"
                checked={!!input.lactoseFree}
                onChange={(e) => setInput((s) => ({ ...s, lactoseFree: e.target.checked }))}
              /> <span role="img" aria-label="lactose-free">🚫🥛</span> {t("dietaryLabels.lactoseFree", "Laktozsuz")}
            </label>
          </AiChecks>

          <FieldWide>
            <Label>{t("categories", "Kategoriler")}</Label>
            <CatDropdown ref={ddRef}>
              <CatButton
                type="button"
                aria-haspopup="listbox"
                aria-expanded={catOpen}
                onClick={() => setCatOpen((v) => !v)}
                title={selectedChips.map((c) => c.label).join(", ") || t("ai.select_categories", "Kategori seç")}
              >
                <span className="text">
                  {selectedChips.length
                    ? `${selectedChips.length} ${t("selected", "seçili")}`
                    : t("ai.select_categories", "Kategori seç")}
                </span>
                <span className="chev" aria-hidden>▾</span>
              </CatButton>

              {catOpen && (
                <CatMenu role="listbox" aria-multiselectable>
                  <div className="head">
                    <Input
                      placeholder={t("search", "Ara…")}
                      value={catQuery}
                      onChange={(e) => setCatQuery(e.target.value)}
                    />
                  </div>

                  <CatList>
                    {filteredCategories.length === 0 && (
                      <EmptyItem>{t("empty", "Sonuç yok")}</EmptyItem>
                    )}
                    {filteredCategories.map((o) => {
                      const checked = selectedCategoryIds.includes(o.id);
                      return (
                        <CatItem
                          key={o.id}
                          $checked={checked}
                          onClick={() => toggleCat(o.id)}
                          role="option"
                          aria-selected={checked}
                        >
                          <input type="checkbox" tabIndex={-1} readOnly checked={checked} />
                          <span className="label" title={o.label}>{o.label}</span>
                        </CatItem>
                      );
                    })}
                  </CatList>

                  <CatFoot>
                    <Small type="button" onClick={selectAll}>{t("all", "Tümü")}</Small>
                    <Small type="button" onClick={clearAll}>{t("clear", "Temizle")}</Small>
                    <Primary type="button" onClick={() => setCatOpen(false)}>{t("done", "Tamam")}</Primary>
                  </CatFoot>
                </CatMenu>
              )}
            </CatDropdown>

            {!!selectedChips.length && (
              <TagRow style={{ marginTop: 6 }}>
                {selectedChips.map((c) => (
                  <TagChip key={c.id} onClick={() => toggleCat(c.id)}>
                    {c.label} <span aria-hidden>×</span>
                  </TagChip>
                ))}
              </TagRow>
            )}

            <Help>{t("ai.category_help", "Seçilen kategoriler, üretimden sonra tarife atanır (yetkin varsa).")}</Help>
          </FieldWide>

          <SectionTitle>{t("ai.ing_prefs", "Malzeme Tercihleri")}</SectionTitle>

          <FieldWide>
            <Label>{t("ai.include_ings", "İçerilecek Malzemeler")}</Label>
            <TagRow>
              {incl.map((tag) => (
                <TagChip key={tag} onClick={() => setIncl((arr) => arr.filter((x) => x !== tag))}>
                  {tag} <span aria-hidden>×</span>
                </TagChip>
              ))}
              <TagInputBox
                placeholder={t("ai.include_ph", "malzeme yazıp Enter")}
                value={inclDraft}
                onChange={(e) => setInclDraft(e.target.value)}
                onKeyDown={onInclKey}
                onPaste={onInclPaste}
              />
            </TagRow>
            <Help>{t("ai.include_help", "Enter veya virgülle ekleyebilirsin. Örn: “domates, biber”.")}</Help>
          </FieldWide>

          <FieldWide>
            <Label>{t("ai.exclude_ings", "Hariç Malzemeler")}</Label>
            <TagRow>
              {excl.map((tag) => (
                <TagChip key={tag} data-variant="danger" onClick={() => setExcl((arr) => arr.filter((x) => x !== tag))}>
                  {tag} <span aria-hidden>×</span>
                </TagChip>
              ))}
              <TagInputBox
                placeholder={t("ai.exclude_ph", "hariç tutulacak…")}
                value={exclDraft}
                onChange={(e) => setExclDraft(e.target.value)}
                onKeyDown={onExclKey}
                onPaste={onExclPaste}
              />
            </TagRow>
            <Help>{t("ai.exclude_help", "Enter veya virgülle ekleyebilirsin. Örn: “acı, yer fıstığı”.")}</Help>
          </FieldWide>

          <Divider />

          {/* ✅ Ana Prompt Alanı */}
          <FieldWide>
            <Label>{t("ai.extra_prompt", "Prompt (tüm kriterlerin)")}</Label>
            <TextArea
              rows={3}
              placeholder={promptPH}
              value={input.prompt || ""}
              onChange={(e) => setInput((s) => ({ ...s, prompt: e.target.value }))}
            />
            <Help>
              {t(
                "ai.prompt_help",
                "Buraya tarif için tüm isteklerini tek seferde yaz: mutfak, süre, kişi sayısı, diyet kısıtları, pişirme yöntemi, sunum, ölçü formatı vb."
              )}
            </Help>
            <PromptChips role="list" aria-label={t("ai.quick_prompts", "Hızlı istekler")}>
              {presetPrompts.map((p) => (
                <PromptChip role="listitem" key={p} onClick={() => addPreset(p)}>{p}</PromptChip>
              ))}
            </PromptChips>
          </FieldWide>

          <AiFoot>
            <Toggle>
              <label>
                <input
                  type="radio"
                  name="aimode"
                  value="replace"
                  checked={mode === "replace"}
                  onChange={() => setMode("replace")}
                /> Replace
              </label>
              <label>
                <input
                  type="radio"
                  name="aimode"
                  value="merge"
                  checked={mode === "merge"}
                  onChange={() => setMode("merge")}
                /> Merge
              </label>
            </Toggle>
            <div style={{ display: "flex", gap: 8 }}>
              <Small
                type="button"
                onClick={() => setInput((s) => ({ ...s, cuisine: "turkish", maxMinutes: 25, servings: 4 }))}
              >
                ⚙ {t("ai.example", "Örnek")}
              </Small>
              <Primary type="button" onClick={run} disabled={loading}>
                {loading ? t("ai.generating", "Oluşturuluyor…") : t("ai.generate", "Oluştur")}
              </Primary>
            </div>
          </AiFoot>

          {err && <Note className="err">❌ {err}</Note>}
          {ok && <Note className="ok">{ok}</Note>}
        </AiGrid>
      )}
    </AiCard>
  );
}

/* ===== Dropdown styled ===== */
const CatDropdown = styled.div`position: relative; display: inline-block; width: 100%;`;
const CatButton = styled.button`
  width: 100%;
  display: flex; align-items: center; justify-content: space-between;
  gap: ${({ theme }) => theme.spacings.xs};
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  cursor: pointer;
  transition: border-color ${({ theme }) => theme.transition.fast}, background ${({ theme }) => theme.transition.fast};
  &:hover { background: ${({ theme }) => theme.colors.inputBackgroundFocus}; }
  &:focus-visible {
    outline: none; border-color: ${({ theme }) => theme.colors.inputBorderFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
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
  display: grid; grid-template-rows: auto minmax(120px, 280px) auto; overflow: hidden;
  .head { padding: 8px; border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright}; }
`;
const CatList = styled.div`max-height: 280px; overflow: auto;`;
const CatItem = styled.button<{ $checked?: boolean }>`
  width: 100%; display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; text-align: left; cursor: pointer;
  background: ${({ theme, $checked }) => $checked ? theme.colors.primaryTransparent : "transparent"};
  border: 0; border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
  color: ${({ theme }) => theme.colors.text};
  transition: background ${({ theme }) => theme.transition.fast};
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
