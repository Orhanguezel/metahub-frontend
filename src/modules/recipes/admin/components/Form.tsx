"use client";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/recipes/locales";
import type { IRecipe, RecipeCategory, IRecipeImage } from "@/modules/recipes/types";
import type { SupportedLocale } from "@/types/recipes/common";
import { SUPPORTED_LOCALES, getMultiLang } from "@/types/recipes/common";

import {
  PREFERRED_CANONICAL_ORDER,
  SERVE_TEXT,
  SERVE_CUES,
  TAG_CANON,
  canonicalizeCuisine,
} from "@/modules/recipes/utils/ai.constants";

import { JSONEditor, ImageUploader } from "@/shared";

import RecipeAIGenerator from "./RecipeAIGenerator";
import {
  Form, Row, TopBar, LangGroup, LangBtn, SEOBox, Col, BlockTitle, Label, Input, TextArea,
  CheckRow, Select, SmallRow, Small, Chips, Chip, ModeRow, ModeBtn, Actions, Primary, Secondary
} from "./styled";

import type { TL, UploadImage } from "../../types";
import { getUILang, setTL, getTLStrict, toTL, parseId, slugifyLite, mapAiTagsToKeys } from "../../utils/utils";

type Props = {
  categories: RecipeCategory[];
  initial?: IRecipe | null;
  onSubmit: (formData: FormData, id?: string) => Promise<void> | void;
  onCancel: () => void;
  onAddCategory: () => void;
};

export default function RecipesForm({ categories, initial, onSubmit, onCancel, onAddCategory }: Props) {
  const { t, i18n } = useI18nNamespace("recipes", translations);
  const uiLang = useMemo<SupportedLocale>(() => getUILang(i18n?.language), [i18n?.language]);
  const [editLang, setEditLang] = useState<SupportedLocale>(uiLang);
  const isEdit = Boolean(initial?._id);

  const [editMode, setEditMode] = useState<"simple" | "json">("simple");

  // temel alanlar
  const [slug, setSlug] = useState<string>("");
  const [autoSlug, setAutoSlug] = useState<boolean>(true);
  const [title, setTitle] = useState<TL>({});
  const [description, setDescription] = useState<TL>({});
  const [order, setOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isPublished, setIsPublished] = useState<boolean>(true);

  // kategoriler
  const [categoryIds, setCategoryIds] = useState<string[]>([]);

  // cuisines & tags
  const [cuisinesStr, setCuisinesStr] = useState<string>("");
  const [tagsStr, setTagsStr] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // sayısal alanlar
  const [servings, setServings] = useState<number | undefined>(undefined);
  const [prepMinutes, setPrepMinutes] = useState<number | undefined>(undefined);
  const [cookMinutes, setCookMinutes] = useState<number | undefined>(undefined);
  const [totalMinutes, setTotalMinutes] = useState<number | undefined>(undefined);
  const [autoTotal, setAutoTotal] = useState<boolean>(true);
  const [calories, setCalories] = useState<number | undefined>(undefined);

  // tarihler
  const [effectiveFrom, setEffectiveFrom] = useState<string>("");
  const [effectiveTo, setEffectiveTo] = useState<string>("");

  // ingredients & steps
  const [ingredientsJson, setIngredientsJson] = useState<any[]>([]);
  const [stepsJson, setStepsJson] = useState<any[]>([]);

  // images
  const originalExisting = useMemo<IRecipeImage[]>(
    () => ((initial?.images || []) as IRecipeImage[]),
    [initial?.images]
  );
  const [existingUploads, setExistingUploads] = useState<UploadImage[]>(
    () =>
      originalExisting.map((img) => ({
        url: img.url, thumbnail: img.thumbnail, webp: img.webp, publicId: img.publicId,
      }))
  );
  const [removedExisting, setRemovedExisting] = useState<UploadImage[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  // init
  useEffect(() => {
    const categoriesFromInitial: string[] = Array.isArray(initial?.categories)
      ? (initial!.categories as any[]).map(parseId).filter(Boolean)
      : [];

    setSlug("");
    setTitle(toTL(initial?.title));
    setDescription(toTL(initial?.description));
    setOrder(Number(initial?.order ?? 0));
    setIsActive(initial?.isActive ?? true);
    setIsPublished(initial?.isPublished ?? true);
    setCategoryIds(categoriesFromInitial);

    setCuisinesStr(Array.isArray(initial?.cuisines) ? initial!.cuisines.join(", ") : "");

    const fromTags =
      Array.isArray(initial?.tags)
        ? (initial!.tags as any[])
            .map((t) => (typeof t === "string" ? t : (t?.en || t?.tr || Object.values(t || {})[0] || "")))
            .filter(Boolean)
        : [];
    setTagsStr(fromTags.join(", "));
    setSelectedTags(fromTags);

    setServings(initial?.servings);
    setPrepMinutes(initial?.prepMinutes);
    setCookMinutes(initial?.cookMinutes);
    setTotalMinutes(initial?.totalMinutes);
    setCalories(initial?.calories);

    setEffectiveFrom(initial?.effectiveFrom ? new Date(initial.effectiveFrom as any).toISOString().slice(0, 16) : "");
    setEffectiveTo(initial?.effectiveTo ? new Date(initial.effectiveTo as any).toISOString().slice(0, 16) : "");

    setExistingUploads(
      (initial?.images || []).map((img) => ({
        url: (img as any).url, thumbnail: (img as any).thumbnail, webp: (img as any).webp, publicId: (img as any).publicId,
      }))
    );
    setRemovedExisting([]);
    setNewFiles([]);

    setIngredientsJson((initial?.ingredients as any) || []);
    setStepsJson((initial?.steps as any) || []);
  }, [initial]);

  // yardımcı memolar
  const categoriesOpts = useMemo(
    () =>
      (categories || []).map((c) => ({
        id: c._id,
        label: getMultiLang(c.name as any, editLang) || c.slug || String(c._id),
      })),
    [categories, editLang]
  );

  const canonicalTitle = useMemo(() => {
    for (const l of PREFERRED_CANONICAL_ORDER) {
      const v = (title as any)?.[l];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
    const v1 = getTLStrict(title, editLang);
    if (v1) return v1;
    const anyVal = Object.values(title || {}).find((x) => typeof x === "string" && x.trim());
    return (anyVal as string) || "";
  }, [title, editLang]);

  useEffect(() => {
    if (!autoSlug) return;
    if (!canonicalTitle) return;
    setSlug(slugifyLite(canonicalTitle));
  }, [autoSlug, canonicalTitle]);

  useEffect(() => {
    if (!autoTotal) return;
    const p = Number(prepMinutes || 0);
    const c = Number(cookMinutes || 0);
    const sum = p + c;
    if (Number.isFinite(sum)) setTotalMinutes(sum);
  }, [autoTotal, prepMinutes, cookMinutes]);

  const hasServeCue = useMemo(() => {
    const cues = SERVE_CUES[editLang] || [];
    const texts: string[] = (stepsJson || []).map((s: any) => String((s?.text?.[editLang] || "")));
    return cues.some((re) => texts.some((tx) => re.test(tx)));
  }, [stepsJson, editLang]);

  const addServeStep = () => {
    const nextOrder = (stepsJson?.length || 0) + 1;
    const serveTL: TL = { ...SERVE_TEXT } as any;
    setStepsJson([...(stepsJson || []), { order: nextOrder, text: serveTL }]);
  };

  const tagSuggestions = useMemo(() => {
    const entries = Object.entries(TAG_CANON) as [string, any][];
    return entries.map(([key, tl]) => ({ key, label: (tl as any)[editLang] || (tl as any).en || key }));
  }, [editLang]);

  const toggleTag = (key: string) => {
    const has = selectedTags.includes(key);
    const next = has ? selectedTags.filter((k) => k !== key) : [...selectedTags, key];
    setSelectedTags(next); setTagsStr(next.join(", "));
  };

  const applyCuisineCanon = () => {
    const arr = cuisinesStr.split(",").map((s) => s.trim()).filter(Boolean).map((c) => canonicalizeCuisine(c));
    const uniq = Array.from(new Set(arr));
    setCuisinesStr(uniq.join(", "));
  };

  // AI sonucunu forma uygula
  const applyAiToForm = (ai: any, mode: "replace" | "merge") => {
    const nextTitle: TL = ai?.title || {};
    const nextDesc: TL = ai?.description || {};

    const applyTL = (curr: TL, next: TL): TL =>
      mode === "replace"
        ? next
        : ({ ...curr, ...Object.fromEntries(Object.entries(next || {}).filter(([, v]) => !!(v as string)?.trim())) });

    setTitle((curr) => applyTL(curr, nextTitle));
    setDescription((curr) => applyTL(curr, nextDesc));

    // slug
    const s = ai?.slugCanonical || ai?.slug?.[editLang] || ai?.slug?.en || "";
    if (mode === "replace" || !slug) setSlug(slugifyLite(String(s || "")));

    // cuisines
    const cuisines: string[] = Array.isArray(ai?.cuisines) ? ai.cuisines.map(canonicalizeCuisine) : [];
    if (mode === "replace" || !cuisinesStr) setCuisinesStr(cuisines.join(", "));

    // tags -> canonical keys
    const keys = mapAiTagsToKeys(ai?.tags || []);
    if (keys.length) {
      if (mode === "replace") {
        setSelectedTags(keys); setTagsStr(keys.join(", "));
      } else {
        const union = Array.from(new Set([...(selectedTags || []), ...keys]));
        setSelectedTags(union); setTagsStr(union.join(", "));
      }
    }

    // numbers
    const setNumber = (setter: (n?: number) => void, val: any) => {
      const n = Number(val); if (Number.isFinite(n)) setter(n);
    };
    if (mode === "replace" || servings == null) setNumber(setServings, ai?.servings);
    if (mode === "replace" || prepMinutes == null) setNumber(setPrepMinutes, ai?.prepMinutes);
    if (mode === "replace" || cookMinutes == null) setNumber(setCookMinutes, ai?.cookMinutes);
    if (mode === "replace" || totalMinutes == null) setNumber(setTotalMinutes, ai?.totalMinutes);
    if (mode === "replace" || calories == null) setNumber(setCalories, ai?.calories);

    // booleans
    if (typeof ai?.isPublished === "boolean" && (mode === "replace")) setIsPublished(ai.isPublished);
    if (typeof ai?.isActive === "boolean" && (mode === "replace")) setIsActive(ai.isActive);

    // ingredients / steps
    if (Array.isArray(ai?.ingredients)) {
      setIngredientsJson(mode === "replace" ? ai.ingredients : [...(ingredientsJson || []), ...ai.ingredients]);
    }
    if (Array.isArray(ai?.steps)) {
      setStepsJson(mode === "replace" ? ai.steps : [...(stepsJson || []), ...ai.steps]);
    }
  };

  // submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(ingredientsJson || []).length) { alert(t("ingredients_required", "Lütfen malzemeleri girin (JSON).")); return; }
    if (!(stepsJson || []).length) { alert(t("steps_required", "Lütfen adımları girin (JSON).")); return; }

    const fd = new FormData();
    if (slug) fd.append("slug", slug);
    fd.append("isActive", String(isActive));
    fd.append("isPublished", String(isPublished));
    fd.append("order", String(Number(order) || 0));
    fd.append("title", JSON.stringify(title || {}));
    fd.append("description", JSON.stringify(description || {}));

    if (categoryIds.length) fd.append("categories", JSON.stringify(categoryIds));

    if (cuisinesStr.trim()) {
      const arr = cuisinesStr.split(",").map((s) => s.trim()).filter(Boolean);
      if (arr.length) fd.append("cuisines", JSON.stringify(arr));
    }

    const freeTags = tagsStr.split(",").map((s) => s.trim()).filter(Boolean);
    const unionTags = Array.from(new Set([...(selectedTags || []), ...freeTags]));
    if (unionTags.length) fd.append("tags", JSON.stringify(unionTags));

    if (servings != null) fd.append("servings", String(servings));
    if (prepMinutes != null) fd.append("prepMinutes", String(prepMinutes));
    if (cookMinutes != null) fd.append("cookMinutes", String(cookMinutes));
    if (totalMinutes != null) fd.append("totalMinutes", String(totalMinutes));
    if (calories != null) fd.append("calories", String(calories));

    if (effectiveFrom) fd.append("effectiveFrom", new Date(effectiveFrom).toISOString());
    if (effectiveTo) fd.append("effectiveTo", new Date(effectiveTo).toISOString());

    fd.append("ingredients", JSON.stringify(ingredientsJson || []));
    fd.append("steps", JSON.stringify(stepsJson || []));

    newFiles.forEach((file) => fd.append("images", file));

    if (removedExisting.length) {
      const removeUrls = removedExisting.map((x) => x.url).filter(Boolean);
      if (removeUrls.length) fd.append("removedImages", JSON.stringify(removeUrls));
    }

    if (isEdit && initial?._id) await onSubmit(fd, initial._id);
    else await onSubmit(fd);
  };

  const LangPill = useCallback(
    (l: SupportedLocale) => (
      <LangBtn key={l} type="button" aria-pressed={editLang === l} $active={editLang === l} onClick={() => setEditLang(l)} title={l}>
        {l.toUpperCase()}
      </LangBtn>
    ),
    [editLang]
  );

  return (
    <Form onSubmit={handleSubmit}>
      {/* Üst şerit: Dil & SEO */}
      <TopBar>
        <LangGroup role="group" aria-label={t("language", "Language")}>
          {(SUPPORTED_LOCALES as readonly SupportedLocale[]).map(LangPill)}
        </LangGroup>

        <SEOBox aria-label="SEO preview">
          <div className="row1">
            <span className="host">tarifintarifi.com</span>
            <span className="path">{`/tarifler/${slug?.trim() || slugifyLite(canonicalTitle || "tarif")}`}</span>
          </div>
          <div className="row2">{getTLStrict(title, editLang) || canonicalTitle || t("recipe", "Tarif")}</div>
          <div className="row3">{(getTLStrict(description, editLang) || "").slice(0, 140) || t("desc_ph", "Kısa açıklama…")}</div>
        </SEOBox>
      </TopBar>

      {/* AI Generator – reusable (public'te de kullan) */}
      <RecipeAIGenerator defaultLang={editLang} endpoint="/api/recipes/ai/generate" onGenerated={applyAiToForm} compact />

      {/* Üst Satır */}
      <Row>
        <Col>
          <Label>{t("slug", "Slug")}</Label>
          <Input value={slug} onChange={(e)=>setSlug(e.target.value)} placeholder={t("slug_ph", "ornek-slug")} disabled={autoSlug}/>
          <SmallRow>
            <small>
              <input id="autoslug" type="checkbox" checked={autoSlug} onChange={(e)=>setAutoSlug(e.target.checked)}/> <label htmlFor="autoslug">{t("auto_from_title", "Başlıktan otomatik üret")}</label>
            </small>
          </SmallRow>
        </Col>

        <Col>
          <Label>{t("categories", "Categories")}</Label>
          <Select multiple value={categoryIds} onChange={(e)=>setCategoryIds(Array.from(e.target.selectedOptions).map((o)=>o.value))}>
            {categoriesOpts.map((o)=> (<option key={o.id} value={o.id}>{o.label}</option>))}
          </Select>
          <Small type="button" onClick={onAddCategory}>+ {t("newCategory", "New Category")}</Small>
        </Col>

        <Col>
          <Label>{t("order", "Order")}</Label>
          <Input type="number" min={0} value={order} onChange={(e)=>setOrder(Number(e.target.value) || 0)} />
        </Col>

        <Col>
          <Label>{t("isActive", "Active?")}</Label>
          <CheckRow><input type="checkbox" checked={isActive} onChange={(e)=>setIsActive(e.target.checked)} /><span>{isActive ? t("yes", "Yes") : t("no", "No")}</span></CheckRow>
        </Col>
      </Row>

      {/* Dil alanları */}
      <Row>
        <Col style={{ gridColumn: "span 2" }}>
          <Label>{t("titleField", "Title")} ({editLang})</Label>
          <Input value={getTLStrict(title, editLang)} onChange={(e)=>setTitle(setTL(title, editLang, e.target.value))}/>
        </Col>
        <Col style={{ gridColumn: "span 2" }}>
          <Label>{t("description", "Description")} ({editLang})</Label>
          <TextArea rows={2} value={getTLStrict(description, editLang)} onChange={(e)=>setDescription(setTL(description, editLang, e.target.value))}/>
        </Col>
      </Row>

      {/* Düzen modu */}
      <ModeRow role="radiogroup" aria-label={t("editMode", "Edit Mode")}>
        <ModeBtn type="button" aria-pressed={editMode === "simple"} $active={editMode === "simple"} onClick={()=>setEditMode("simple")}>{t("simpleMode", "Basit")}</ModeBtn>
        <ModeBtn type="button" aria-pressed={editMode === "json"} $active={editMode === "json"} onClick={()=>setEditMode("json")}>{t("jsonMode", "JSON Editor")}</ModeBtn>
      </ModeRow>

      {editMode === "simple" ? (
        <>
          <Row>
            <Col>
              <Label>{t("cuisines", "Cuisines (comma)")}</Label>
              <Input value={cuisinesStr} onChange={(e)=>setCuisinesStr(e.target.value)} placeholder="turkish, italian" />
              <SmallRow><Small type="button" onClick={applyCuisineCanon}>✨ {t("canonize", "Kanonik isimlere çevir")}</Small></SmallRow>
            </Col>

            <Col>
              <Label>{t("tags", "Tags")}</Label>
              <Input value={tagsStr} onChange={(e)=>setTagsStr(e.target.value)} placeholder="quick, vegan" />
              <Chips role="list" aria-label={t("suggested_tags", "Önerilen etiketler")}>
                {tagSuggestions.map((s)=> (
                  <Chip role="listitem" key={s.key} $on={selectedTags.includes(s.key)} onClick={()=>toggleTag(s.key)} title={s.key}>
                    {s.label}
                  </Chip>
                ))}
              </Chips>
            </Col>

            <Col>
              <Label>{t("servings", "Servings")}</Label>
              <Input type="number" min={1} value={servings ?? ""} onChange={(e)=>setServings(e.target.value ? Number(e.target.value) : undefined)} />
            </Col>

            <Col>
              <Label>{t("calories", "Calories")}</Label>
              <Input type="number" min={0} value={calories ?? ""} onChange={(e)=>setCalories(e.target.value ? Number(e.target.value) : undefined)} />
            </Col>
          </Row>

          <Row>
            <Col>
              <Label>{t("prepMinutes", "Prep (min)")}</Label>
              <Input type="number" min={0} value={prepMinutes ?? ""} onChange={(e)=>setPrepMinutes(e.target.value ? Number(e.target.value) : undefined)} />
            </Col>
            <Col>
              <Label>{t("cookMinutes", "Cook (min)")}</Label>
              <Input type="number" min={0} value={cookMinutes ?? ""} onChange={(e)=>setCookMinutes(e.target.value ? Number(e.target.value) : undefined)} />
            </Col>
            <Col>
              <Label>{t("totalMinutes", "Total (min)")}</Label>
              <Input type="number" min={0} value={totalMinutes ?? ""} onChange={(e)=>setTotalMinutes(e.target.value ? Number(e.target.value) : undefined)} disabled={autoTotal}/>
              <SmallRow>
                <small><input id="autototal" type="checkbox" checked={autoTotal} onChange={(e)=>setAutoTotal(e.target.checked)} /> <label htmlFor="autototal">{t("auto_sum", "Hazırlık + Pişirme")}</label></small>
              </SmallRow>
            </Col>
            <Col>
              <Label>{t("isPublished", "Published?")}</Label>
              <CheckRow><input type="checkbox" checked={isPublished} onChange={(e)=>setIsPublished(e.target.checked)} /><span>{isPublished ? t("yes", "Yes") : t("no", "No")}</span></CheckRow>
            </Col>
          </Row>

          <Row>
            <Col>
              <Label>{t("effectiveFrom", "Effective From")}</Label>
              <Input type="datetime-local" value={effectiveFrom} onChange={(e)=>setEffectiveFrom(e.target.value)} />
            </Col>
            <Col>
              <Label>{t("effectiveTo", "Effective To")}</Label>
              <Input type="datetime-local" value={effectiveTo} onChange={(e)=>setEffectiveTo(e.target.value)} />
            </Col>
            <Col style={{ alignSelf:"end" }}>
              {!hasServeCue && (<Small type="button" onClick={addServeStep} title="Son adıma 'servis' ekle">➕ {t("add_serve_step", "Servis adımı ekle")}</Small>)}
            </Col>
            <Col />
          </Row>

          <Row>
            <Col style={{ gridColumn: "span 2" }}>
              <JSONEditor label={t("ingredients", "Ingredients (JSON)")} value={ingredientsJson} onChange={setIngredientsJson} />
            </Col>
            <Col style={{ gridColumn: "span 2" }}>
              <JSONEditor label={t("steps", "Steps (JSON)")} value={stepsJson} onChange={setStepsJson} />
            </Col>
          </Row>
        </>
      ) : (
        <Row>
          <Col style={{ gridColumn: "span 4" }}>
            <JSONEditor
              label={t("ingredients_steps_json", "Ingredients + Steps (JSON)")}
              value={{ ingredients: ingredientsJson, steps: stepsJson }}
              onChange={(v: any) => {
                setIngredientsJson(Array.isArray(v?.ingredients) ? v.ingredients : []);
                setStepsJson(Array.isArray(v?.steps) ? v.steps : []);
              }}
            />
          </Col>
        </Row>
      )}

      {/* Görsel yükleme */}
      <BlockTitle>{t("images", "Images")}</BlockTitle>
      <ImageUploader
        existing={existingUploads}
        onExistingChange={setExistingUploads}
        removedExisting={removedExisting}
        onRemovedExistingChange={setRemovedExisting}
        files={newFiles}
        onFilesChange={setNewFiles}
        maxFiles={10}
        accept="image/*"
        sizeLimitMB={15}
        helpText={t("uploader.help", "jpg/png/webp • sıra korunur")}
      />

      <Actions>
        <Secondary type="button" onClick={onCancel}>{t("cancel", "Cancel")}</Secondary>
        <Primary type="submit">{isEdit ? t("update", "Update") : t("create", "Create")}</Primary>
      </Actions>
    </Form>
  );
}
