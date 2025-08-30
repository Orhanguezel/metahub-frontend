"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/menu/locales";
import type { SupportedLocale, TranslatedLabel } from "@/types/common";
import { SUPPORTED_LOCALES } from "@/types/common";
import { getUILang } from "@/i18n/getUILang";

import type {
  IMenuItem,
  MenuItemCreatePayload,
  MenuItemUpdatePayload,
} from "@/modules/menu/types/menuitem";
import apiCall from "@/lib/apiCall";
import { JSONEditor } from "@/shared";

import { ItemBasics, ItemImages, ItemStructured } from "@/modules/menu";

import { type StructuredObj } from "./ItemStructured/ItemStructured";
import {
  Actions,
  Form,
  HelpText,
  ModeBtn,
  ModeRow,
  Primary,
  Secondary,
} from "./ItemForm.styles";
import { ADDITIVE_KEYS, ALLERGEN_KEYS } from "@/modules/menu/constants/foodLabels";

/* ===== TranslatedLabel helpers (tüm diller zorunlu) ===== */
const makeTL = (initial?: Partial<TranslatedLabel>): TranslatedLabel => {
  const base = SUPPORTED_LOCALES.reduce((acc, l) => {
    (acc as any)[l] = "";
    return acc;
  }, {} as TranslatedLabel);
  return { ...base, ...(initial || {}) };
};
const ensureTL = (v: any, lang: SupportedLocale): TranslatedLabel => {
  if (v && typeof v === "object" && !Array.isArray(v)) return makeTL(v as Partial<TranslatedLabel>);
  if (v == null || v === "") return makeTL();
  return makeTL({ [lang]: String(v) } as Partial<TranslatedLabel>);
};
const setTL = (obj: Partial<TranslatedLabel> | undefined, l: SupportedLocale, val: string): TranslatedLabel =>
  ({ ...makeTL(obj), [l]: val });
const getTLStrict = (obj?: TranslatedLabel, l?: SupportedLocale) => (l ? obj?.[l] ?? "" : "");

/* numbers / booleans */
const toFloat = (v: any): number | undefined => {
  if (v === "" || v == null) return undefined;
  const s = typeof v === "string" ? v.replace(",", ".") : v;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};
const truthy = (v: any) => v === true || v === "true" || v === 1 || v === "1";

/* basic types */
type MenuCategory = {
  _id: string;
  code?: string;
  slug?: string;
  name?: TranslatedLabel;
  images?: any[];
  order?: number;
};

type Props = {
  isOpen: boolean;
  editingItem: IMenuItem | null;
  onClose: () => void;
  onSubmit: (
    payload: MenuItemCreatePayload | MenuItemUpdatePayload | FormData,
    id?: string
  ) => Promise<void> | void;
};

/* --- 🔧 VARIANT NORMALIZATION: prices hep dizi olsun --- */
const normalizeVariant = (v: any) => ({
  ...v,
  prices: Array.isArray(v?.prices) ? v.prices : [],
});

export default function ItemForm({ isOpen, editingItem, onClose, onSubmit }: Props) {
  const { t, i18n } = useI18nNamespace("menu", translations);
  const lang = useMemo<SupportedLocale>(() => getUILang(i18n?.language), [i18n?.language]);
  const isEdit = Boolean(editingItem?._id);

  const tt = useCallback((k: string, d?: string) => t(k, { defaultValue: d }), [t]);

  const [editMode, setEditMode] = useState<"simple" | "json">("simple");

  // basic
  const [code, setCode] = useState<string>(editingItem?.code || `MI-${Date.now().toString(36).toUpperCase()}`);
  const [name, setName] = useState<TranslatedLabel>(makeTL());
  const [description, setDescription] = useState<TranslatedLabel>(makeTL());
  const [sku, setSku] = useState<string>(editingItem?.sku || "");
  const [barcode, setBarcode] = useState<string>(editingItem?.barcode || "");
  const [taxCode, setTaxCode] = useState<string>(editingItem?.taxCode || "");
  const [isActive, setIsActive] = useState<boolean>(editingItem?.isActive ?? true);
  const [isPublished, setIsPublished] = useState<boolean>(editingItem?.isPublished ?? false);

  // structured
  const [structured, setStructured] = useState<StructuredObj>({
    categories: editingItem?.categories || [],
    variants: (editingItem?.variants || []).map(normalizeVariant), // ✅ prices normalize
    modifierGroups: editingItem?.modifierGroups || [],
    allergens: editingItem?.allergens || [],
    additives: editingItem?.additives || [],
    dietary: editingItem?.dietary || {},
    ops: editingItem?.ops || { availability: { delivery: true, pickup: true, dinein: true } },
  });

  // categories source
  const [allCats, setAllCats] = useState<MenuCategory[]>([]);
  const catLabel = (c?: MenuCategory) => (c && (getTLStrict(c.name, lang) || c.slug || c.code || c._id)) || "";

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const res = await apiCall("get", "/menucategory/admin", { limit: 500 });
        const list: MenuCategory[] = (res?.data ?? res) || [];
        setAllCats(Array.isArray(list) ? list : []);
      } catch {
        setAllCats([]);
      }
    })();
  }, [isOpen]);

  // images
  type UploadImage = { url: string; thumbnail?: string; webp?: string; publicId?: string; };
  const initialExisting = (editingItem?.images || []).map((im) => ({
    url: im.url, thumbnail: im.thumbnail, webp: im.webp, publicId: im.publicId,
  })) as UploadImage[];
  const [existingUploads, setExistingUploads] = useState<UploadImage[]>(initialExisting);
  const [removedExisting, setRemovedExisting] = useState<UploadImage[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  // refresh when editingItem changes
  useEffect(() => {
    if (editingItem) {
      setCode(editingItem.code || "");
      setName(makeTL(editingItem.name as Partial<TranslatedLabel>));
      setDescription(makeTL(editingItem.description as Partial<TranslatedLabel>));
      setSku(editingItem.sku || "");
      setBarcode(editingItem.barcode || "");
      setTaxCode(editingItem.taxCode || "");
      setIsActive(editingItem.isActive ?? true);
      setIsPublished(editingItem.isPublished ?? false);
      setStructured({
        categories: (editingItem.categories || []).map((c: any) => ({
          category: typeof c?.category === "string" ? c.category : c?.category?._id || c?.category,
          order: c?.order,
          isFeatured: c?.isFeatured,
        })),
        variants: (editingItem.variants || []).map(normalizeVariant), // ✅ prices normalize
        modifierGroups: editingItem.modifierGroups || [],
        allergens: editingItem.allergens || [],
        additives: editingItem.additives || [],
        dietary: editingItem.dietary || {},
        ops: editingItem.ops || { availability: { delivery: true, pickup: true, dinein: true } },
      });
      const exist = (editingItem.images || []).map((im) => ({
        url: im.url, thumbnail: im.thumbnail, webp: im.webp, publicId: im.publicId,
      })) as UploadImage[];
      setExistingUploads(exist);
      setRemovedExisting([]);
      setNewFiles([]);
    } else {
      setCode(`MI-${Date.now().toString(36).toUpperCase()}`);
      setName(makeTL());
      setDescription(makeTL());
      setSku(""); setBarcode(""); setTaxCode("");
      setIsActive(true); setIsPublished(false);
      setStructured({
        categories: [], variants: [], modifierGroups: [], allergens: [], additives: [],
        dietary: {}, ops: { availability: { delivery: true, pickup: true, dinein: true } },
      });
      setExistingUploads([]); setRemovedExisting([]); setNewFiles([]);
    }
  }, [editingItem, lang]);

  /* ===== JSON mode glue ===== */
  const fullJSONValue = useMemo(() => {
    const base: any = { name, description, ...structured, sku, barcode, taxCode, isActive, isPublished };
    if (!isEdit) base.code = code;
    return base;
  }, [name, description, structured, sku, barcode, taxCode, isActive, isPublished, code, isEdit]);

  const jsonPlaceholder = useMemo(() => {
    const emptyTL = makeTL();
    const base: any = {
      name: emptyTL,
      description: emptyTL,
      categories: [{ category: "<categoryId>", order: 1, isFeatured: false }],
      variants: [
        { code: "REG", name: { tr: "Standart", en: "Regular", de: "", pl: "", fr: "", es: "" }, order: 1, isDefault: true, sizeLabel: emptyTL, prices: [] },
      ],
      modifierGroups: [
        { code: "ADDONS", name: { tr: "Ekstralar", en: "Add-ons", de: "", pl: "", fr: "", es: "" }, minSelect: 0, maxSelect: 3, isRequired: false,
          options: [ { code: "CHEESE", name: { tr: "Peynir", en: "Cheese", de: "", pl: "", fr: "", es: "" }, prices: [] } ] },
      ],
      allergens: [{ key: "a", value: { tr: "Gluten", en: "Gluten", de: "", pl: "", fr: "", es: "" } }],
      additives: [{ key: "1", value: { tr: "Asit düzenleyici", en: "Acidity regulator", de: "", pl: "", fr: "", es: "" } }],
      dietary: { vegetarian: false, vegan: false, spicyLevel: 1, containsAlcohol: false },
      ops: { availability: { delivery: true, pickup: true, dinein: true }, minPrepMinutes: 10 },
      sku: "", barcode: "", taxCode: "", isActive: true, isPublished: false,
    };
    if (!isEdit) base.code = "MI-XXXX";
    return JSON.stringify(base, null, 2);
  }, [isEdit]);

  const onFullJSONChange = (v: any) => {
    if (!v || typeof v !== "object") return;
    setName(ensureTL(v.name, lang));
    setDescription(ensureTL(v.description, lang));
    setStructured({
      categories: (v.categories || []).map((c: any) => ({
        category: typeof c?.category === "string" ? c.category : c?.category?._id || c?.category,
        order: c?.order, isFeatured: !!c?.isFeatured,
      })),
      variants: (v.variants || []).map(normalizeVariant), // ✅ prices normalize
      modifierGroups: v.modifierGroups,
      allergens: v.allergens,
      additives: v.additives,
      dietary: v.dietary,
      ops: v.ops,
    });
    setSku(v.sku ?? ""); setBarcode(v.barcode ?? ""); setTaxCode(v.taxCode ?? "");
    setIsActive(Boolean(v.isActive)); setIsPublished(Boolean(v.isPublished));
    if (!isEdit && typeof v.code !== "undefined") setCode(String(v.code || ""));
  };

  /* ===== sanitize & submit ===== */
  const sanitizeCategories = (arr?: any[]) =>
    (arr || [])
      .map((c) => ({
        category: typeof c?.category === "string" ? c.category : c?.category?._id || c?.category,
        order: toFloat(c?.order),
        isFeatured: !!c?.isFeatured,
      }))
      .filter((c) => !!c.category);

  // --- prices helpers
  const sanitizeMoney = (m?: any) =>
    m
      ? {
          amount: toFloat(m.amount) ?? 0,
          currency: String(m.currency || "TRY").toUpperCase(),
          taxIncluded: !!m.taxIncluded,
        }
      : undefined;

  const sanitizeChannels = (arr?: any) => {
    const allowed = new Set(["delivery", "pickup", "dinein"]);
    if (!arr) return undefined;
    const a = Array.isArray(arr) ? arr : [arr];
    const out = a.map(String).filter((x) => allowed.has(x));
    return out.length ? (out as any) : undefined;
  };

  const sanitizePrices = (arr?: any[]) =>
    (arr || [])
      .map((p) => ({
        kind: String(p?.kind || "base"),
        value: sanitizeMoney(p?.value) as any,
        listRef: p?.listRef || undefined,
        activeFrom: p?.activeFrom || undefined,
        activeTo: p?.activeTo || undefined,
        minQty: toFloat(p?.minQty),
        channels: sanitizeChannels(p?.channels),
        outlet: p?.outlet || undefined,
        note: p?.note || undefined,
      }))
      .filter((p) => typeof p.value?.amount === "number" && Number.isFinite(p.value.amount));

  const sanitizeVariants = (arr?: any[]) =>
    (arr || [])
      .map((v) => ({
        code: String(v?.code || "").trim(),
        name: v?.name && typeof v.name === "object" ? makeTL(v.name) : makeTL({ [lang]: String(v?.name || "") } as Partial<TranslatedLabel>),
        order: toFloat(v?.order),
        isDefault: !!v?.isDefault,
        sku: v?.sku || undefined,
        barcode: v?.barcode || undefined,
        sizeLabel: v?.sizeLabel && typeof v.sizeLabel === "object" ? makeTL(v.sizeLabel) : makeTL({ [lang]: String(v?.sizeLabel || "") } as Partial<TranslatedLabel>),
        volumeMl: toFloat(v?.volumeMl),
        netWeightGr: toFloat(v?.netWeightGr),

        // ✅ fiyatlar
        prices: sanitizePrices(v?.prices),

        // legacy referanslar
        priceListItem: v?.priceListItem || undefined,
        depositPriceListItem: v?.depositPriceListItem || undefined,
      }))
      .filter((v) => !!v.code);

  const sanitizeModifierGroups = (arr?: any[]) =>
    (arr || [])
      .map((g) => ({
        code: String(g?.code || "").trim(),
        name: g?.name && typeof g.name === "object" ? makeTL(g.name) : makeTL({ [lang]: String(g?.name || "") } as Partial<TranslatedLabel>),
        order: toFloat(g?.order),
        minSelect: toFloat(g?.minSelect),
        maxSelect: toFloat(g?.maxSelect),
        isRequired: !!g?.isRequired,
        options: (g?.options || [])
          .map((o: any) => ({
            code: String(o?.code || "").trim(),
            name: o?.name && typeof o.name === "object" ? makeTL(o.name) : makeTL({ [lang]: String(o?.name || "") } as Partial<TranslatedLabel>),
            order: toFloat(o?.order),
            isDefault: !!o?.isDefault,

            // ✅ fiyatlar
            prices: sanitizePrices(o?.prices),

            // legacy
            priceListItem: o?.priceListItem || undefined,
          }))
          .filter((o: any) => !!o.code),
      }))
      .filter((g) => !!g.code);

  const sanitizeKV = (arr?: any[]) =>
    (arr || [])
      .map((x) => ({
        key: String(x?.key || "").trim(),
        value: x?.value && typeof x.value === "object" ? makeTL(x.value) : makeTL({ [lang]: String(x?.value || "") } as Partial<TranslatedLabel>),
      }))
      .filter((x) => !!x.key);

  const sanitizeDietary = (d?: any) =>
    d
      ? {
          vegetarian: truthy(d.vegetarian),
          vegan: truthy(d.vegan),
          pescatarian: truthy(d.pescatarian),
          halal: truthy(d.halal),
          kosher: truthy(d.kosher),
          glutenFree: truthy(d.glutenFree),
          lactoseFree: truthy(d.lactoseFree),
          nutFree: truthy(d.nutFree),
          eggFree: truthy(d.eggFree),
          porkFree: truthy(d.porkFree),
          containsAlcohol: truthy(d.containsAlcohol),
          spicyLevel: toFloat(d.spicyLevel),
          caffeineMgPerServing: toFloat(d.caffeineMgPerServing),
          abv: toFloat(d.abv),
          caloriesKcal: toFloat(d.caloriesKcal),
          macros: d?.macros
            ? {
                proteinGr: toFloat(d.macros.proteinGr),
                carbsGr: toFloat(d.macros.carbsGr),
                fatGr: toFloat(d.macros.fatGr),
              }
            : undefined,
        }
      : undefined;

  const sanitizeOps = (o?: any) =>
    o
      ? {
          availability: {
            delivery: truthy(o?.availability?.delivery),
            pickup: truthy(o?.availability?.pickup),
            dinein: truthy(o?.availability?.dinein),
          },
          minPrepMinutes: toFloat(o.minPrepMinutes),
          kitchenSection: o.kitchenSection || undefined,
          availableFrom: o.availableFrom || null,
          availableTo: o.availableTo || null,
        }
      : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEdit && !code.trim()) {
      alert(tt("validation.code_required", "Code is required"));
      return;
    }

    const fd = new FormData();
    if (!isEdit) fd.append("code", code.trim());
    fd.append("name", JSON.stringify(name || {}));
    if (description) fd.append("description", JSON.stringify(description));
    if (sku) fd.append("sku", sku);
    if (barcode) fd.append("barcode", barcode);
    if (taxCode) fd.append("taxCode", taxCode);
    fd.append("isActive", String(!!isActive));
    fd.append("isPublished", String(!!isPublished));

    const cats = sanitizeCategories(structured.categories);
    const vars = sanitizeVariants(structured.variants);
    const mods = sanitizeModifierGroups(structured.modifierGroups);

    // enum dışı key’leri filtrele
    const allergensRaw = sanitizeKV(structured.allergens);
    const additivesRaw = sanitizeKV(structured.additives);
    const allergens = (allergensRaw || []).filter((x) => ALLERGEN_KEYS.includes(x.key as any));
    const additives = (additivesRaw || []).filter((x) => ADDITIVE_KEYS.includes(x.key as any));

    const dietary = sanitizeDietary(structured.dietary);
    const ops = sanitizeOps(structured.ops);

    if (cats?.length) fd.append("categories", JSON.stringify(cats));
    if (vars?.length) fd.append("variants", JSON.stringify(vars));
    if (mods?.length) fd.append("modifierGroups", JSON.stringify(mods));
    if (allergens?.length) fd.append("allergens", JSON.stringify(allergens));
    if (additives?.length) fd.append("additives", JSON.stringify(additives));
    if (dietary) fd.append("dietary", JSON.stringify(dietary));
    if (ops) fd.append("ops", JSON.stringify(ops));

    newFiles.forEach((f) => fd.append("images", f));
    if (removedExisting.length) {
      const urls = removedExisting.map((x) => x.url).filter(Boolean);
      if (urls.length) fd.append("removedImages", JSON.stringify(urls));
    }

    if (isEdit && editingItem?._id) await onSubmit(fd, editingItem._id);
    else await onSubmit(fd);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Form onSubmit={handleSubmit}>
      {/* Mode toggle */}
      <ModeRow role="radiogroup" aria-label={tt("editMode", "Edit Mode")}>
        <ModeBtn type="button" aria-pressed={editMode === "simple"} $active={editMode === "simple"} onClick={() => setEditMode("simple")}>
          {tt("simpleMode", "Basit")}
        </ModeBtn>
        <ModeBtn type="button" aria-pressed={editMode === "json"} $active={editMode === "json"} onClick={() => setEditMode("json")}>
          {tt("jsonMode", "JSON Editor")}
        </ModeBtn>
      </ModeRow>

      {/* SIMPLE */}
      {editMode === "simple" && (
        <>
          <ItemBasics
            lang={lang}
            isEdit={isEdit}
            code={code}
            setCode={setCode}
            name={name}
            onChangeName={(v) => setName(setTL(name, lang, v))}
            description={description}
            onChangeDescription={(v) => setDescription(setTL(description, lang, v))}
            sku={sku}
            setSku={setSku}
            barcode={barcode}
            setBarcode={setBarcode}
            taxCode={taxCode}
            setTaxCode={setTaxCode}
            isActive={isActive}
            setIsActive={setIsActive}
            isPublished={isPublished}
            setIsPublished={setIsPublished}
            t={tt}
            getTLStrict={getTLStrict}
          />

          <ItemStructured
            lang={lang}
            structured={structured}
            setStructured={setStructured}
            allCats={allCats}
            catLabel={catLabel}
            getTLStrict={getTLStrict}
            t={tt}
          />
        </>
      )}

      {/* JSON */}
      {editMode === "json" && (
        <JSONEditor
          label={tt("advanced_json", "Full JSON (advanced)")}
          value={fullJSONValue}
          onChange={onFullJSONChange}
          placeholder={jsonPlaceholder}
        />
      )}

      {/* Images */}
      <ItemImages
        t={tt}
        existingUploads={existingUploads}
        setExistingUploads={setExistingUploads}
        removedExisting={removedExisting}
        setRemovedExisting={setRemovedExisting}
        newFiles={newFiles}
        setNewFiles={setNewFiles}
      />

      <HelpText>
        {editMode === "simple"
          ? tt("json_help_off", "Structured fields are hidden in Simple mode.")
          : tt("json_help_on","Edit all advanced fields at once. Leave keys out to keep them unchanged.")}
      </HelpText>

      <Actions>
        <Secondary type="button" onClick={onClose}>
          {tt("cancel", "Cancel")}
        </Secondary>
        <Primary type="submit">
          {isEdit ? tt("update", "Update") : tt("create", "Create")}
        </Primary>
      </Actions>
    </Form>
  );
}
