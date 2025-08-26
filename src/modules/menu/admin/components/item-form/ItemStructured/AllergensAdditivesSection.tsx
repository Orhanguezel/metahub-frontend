// src/modules/menu/admin/components/item-form/sections/AllergensAdditivesSection.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AddBtn, BlockTitle, Col, Input, Label, Row } from "../ItemForm.styles";
import type { SupportedLocale, TranslatedLabel } from "@/types/common";
import {
  useFoodLabelHelpers,
  ALLERGEN_MAP,
  ADDITIVE_MAP,
} from "@/modules/menu/constants/foodLabels";
import type { StructuredObj, TFunc, TLGetter } from "./types";

type Props = {
  lang: SupportedLocale;
  structured: StructuredObj;
  setStructured: (updater: (p: StructuredObj) => StructuredObj) => void;
  getTLStrict: TLGetter;
  t: TFunc;
};

export default function AllergensAdditivesSection({
  lang, structured, setStructured, getTLStrict, t
}: Props) {
  const { additivesLocalized, allergensLocalized } = useFoodLabelHelpers();

  // mount’ta alanları [] olarak garanti et (undefined kalmasın)
  useEffect(() => {
    setStructured((p) => {
      const next = { ...p };
      let changed = false;
      if (!Array.isArray(p.allergens)) { next.allergens = []; changed = true; }
      if (!Array.isArray(p.additives)) { next.additives = []; changed = true; }
      return changed ? next : p;
    });
  }, [setStructured]);

  // aktif dilde label lookup (sadece önizleme/karşılaştırma için)
  const allergenLabelOf = useMemo<Record<string, string>>(
    () => Object.fromEntries(allergensLocalized.map(a => [a.key, a.label])),
    [allergensLocalized]
  );
  const additiveLabelOf = useMemo<Record<string, string>>(
    () => Object.fromEntries(additivesLocalized.map(a => [a.key, a.label])),
    [additivesLocalized]
  );

  // utility
  const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));
  const normalizeCSV = (s: string) =>
    String(s).split(",").map(x => x.trim()).filter(Boolean);

  // parsers
  const parseAllergenCSV = useCallback((s: string) => {
    const allowed = new Set(Object.keys(allergenLabelOf)); // a..r
    return uniq(normalizeCSV(s.toLowerCase()).filter(k => allowed.has(k)));
  }, [allergenLabelOf]);

  const parseAdditiveCSV = useCallback((s: string) => {
    const allowed = new Set(Object.keys(additiveLabelOf)); // 1..13
    return uniq(normalizeCSV(s).filter(k => allowed.has(k)));
  }, [additiveLabelOf]);

  const joinLabels = (codes: string[], dict: Record<string, string>) =>
    codes.map(c => dict[c] ?? c).join(", ");

  // sözlükten çok dilli TL getir
  const getTLFor = (kind: "allergens" | "additives", code: string): TranslatedLabel | undefined => {
    return (kind === "allergens"
      ? (ALLERGEN_MAP as Record<string, TranslatedLabel>)
      : (ADDITIVE_MAP as Record<string, TranslatedLabel>)
    )[code];
  };

  /* mutations */
  const pushRow = (key: "allergens" | "additives", row: any) =>
    setStructured(p => {
      const list = Array.isArray(p[key]) ? [...(p[key] as any[])] : [];
      const nextKey = String(row?.key ?? "").trim();
      // duplicate koruması (varsa replace et)
      const idx = list.findIndex((x: any) => String(x?.key) === nextKey && nextKey !== "");
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...row };
      } else {
        list.push(row);
      }
      return { ...p, [key]: list };
    });

  const removeRow = (key: "allergens" | "additives", idx: number) =>
    setStructured(p => {
      const list = (p[key] || []).filter((_: any, i: number) => i !== idx);
      // özellikle [] yaz (undefined olmasın ki update payload’a boş dizi gitsin)
      return { ...p, [key]: list.length ? list : [] };
    });

  const clearAll = (key: "allergens" | "additives") =>
    setStructured(p => ({ ...p, [key]: [] }));

  const updateValue = (key: "allergens" | "additives", idx: number, value: string) =>
    setStructured(p => ({
      ...p,
      [key]: (p[key] || []).map((r: any, i: number) =>
        i === idx ? { ...r, value: { ...(r.value || {}), [lang]: value } } : r
      ),
    }));

  // KEY text input (dropdown yok) -> sözlükten tüm dillerle doldur
  const onKeyInput = (
    kind: "allergens" | "additives",
    idx: number,
    raw: string
  ) => {
    let code = String(raw).trim();
    if (!code) {
      // key temizlenirse sadece key’i boşalt
      setStructured(p => {
        const list = (p[kind] || []).slice();
        const row = { ...(list[idx] || {}) };
        row.key = "";
        list[idx] = row;
        return { ...p, [kind]: list };
      });
      return;
    }

    const dict = kind === "allergens" ? allergenLabelOf : additiveLabelOf;
    // allergens -> lower
    // additives -> baştaki 0’ları kırp
    code = kind === "allergens" ? code.toLowerCase() : String(Number(code)).replace(/NaN/, code);

    // basit doğrulama (yalnızca otomatik doldurma için)
    const valid =
      kind === "allergens"
        ? /^[a-r]$/.test(code) && !!dict[code]
        : /^(?:[1-9]|1[0-3])$/.test(code) && !!dict[code];

    setStructured(p => {
      const list = (p[kind] || []).slice();
      const row = { ...(list[idx] || {}) };

      const prevCode = String(row.key ?? "");
      const prevAuto = dict[prevCode] || "";         // önceki otomatik label (aktif dil)
      const current = String(getTLStrict(row.value, lang) || "");

      row.key = code;

      // değer boşsa veya önceki otomatik etikete eşitse ⇒ sözlükten çok dilli TL ile güncelle
      if (valid && (!current || current === prevAuto)) {
        const tl = getTLFor(kind, code);
        if (tl) row.value = { ...tl }; // clone
      }

      list[idx] = row;

      // duplicate: aynı koda sahip başka satır varsa birleştir
      const first = list.findIndex((x: any, i: number) => i !== idx && String(x?.key) === code);
      if (first >= 0) {
        // birleştir ve duplikeyi kaldır
        const merged = {
          ...list[first],
          ...row,
          value: { ...(list[first]?.value || {}), ...(row.value || {}) },
        };
        list.splice(Math.max(first, idx), 1);
        list[Math.min(first, idx)] = merged;
      }

      return { ...p, [kind]: list };
    });
  };

  /* BULK (virgüllü) */
  const [bulkAllergens, setBulkAllergens] = useState("");
  const [bulkAdditives, setBulkAdditives] = useState("");

  const bulkAllergenCodes = useMemo(
    () => parseAllergenCSV(bulkAllergens),
    [bulkAllergens, parseAllergenCSV]
  );
  const bulkAdditiveCodes = useMemo(
    () => parseAdditiveCSV(bulkAdditives),
    [bulkAdditives, parseAdditiveCSV]
  );

  const bulkAllergenPreview = useMemo(
    () => joinLabels(bulkAllergenCodes, allergenLabelOf),
    [bulkAllergenCodes, allergenLabelOf]
  );
  const bulkAdditivePreview = useMemo(
    () => joinLabels(bulkAdditiveCodes, additiveLabelOf),
    [bulkAdditiveCodes, additiveLabelOf]
  );

  const addBulk = (kind: "allergens" | "additives") => {
    const codes = kind === "allergens" ? bulkAllergenCodes : bulkAdditiveCodes;
    if (!codes.length) return;

    setStructured(p => {
      const list = (p[kind] || []).slice();
      const existing = new Set(list.map((x: any) => String(x?.key)));
      for (const c of codes) {
        const tl = getTLFor(kind, c);
        if (existing.has(c)) {
          // varsa güncelle (sözlükle doldur)
          const i = list.findIndex((x: any) => String(x?.key) === c);
          if (i >= 0) list[i] = { ...list[i], value: tl ? { ...tl } : { [lang]: c } };
        } else {
          list.push({ key: c, value: tl ? { ...tl } : { [lang]: c } });
          existing.add(c);
        }
      }
      return { ...p, [kind]: list };
    });

    if (kind === "allergens") setBulkAllergens("");
    else setBulkAdditives("");
  };

  return (
    <>
      {/* ============ ALLERGENS ============ */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <BlockTitle>{t("allergens", "Allergens")}</BlockTitle>
        <button type="button" onClick={() => clearAll("allergens")} style={{ opacity: .8 }}>
          {t("clearAll", "Clear All")}
        </button>
      </div>

      <Row>
        <Col>
          <Label>{t("bulkKeys", "Keys (comma)")}</Label>
          <Input
            placeholder="a,b,c"
            value={bulkAllergens}
            onChange={(e) => setBulkAllergens(e.target.value)}
          />
        </Col>
        <Col style={{ gridColumn: "span 2" }}>
          <Label>{t("bulkValuesPreview", "Values (auto)")}</Label>
          <Input value={bulkAllergenPreview} readOnly />
        </Col>
        <Col style={{ alignItems: "flex-end" }}>
          <button type="button" onClick={() => addBulk("allergens")}>
            + {t("add", "Add")}
          </button>
        </Col>
      </Row>

      {(structured.allergens || []).map((a: any, i: number) => (
        <Row key={`alg-${String(a?.key ?? "")}-${i}`}>
          <Col>
            <Label>{t("key", "Key")}</Label>
            <Input
              placeholder="a"
              value={a.key || ""}
              onChange={(e) => onKeyInput("allergens", i, e.target.value)}
            />
          </Col>
          <Col style={{ gridColumn: "span 2" }}>
            <Label>{t("value", "Value")} ({lang})</Label>
            <Input
              value={getTLStrict(a.value, lang)}
              onChange={(e) => updateValue("allergens", i, e.target.value)}
            />
          </Col>
          <Col style={{ alignItems: "flex-end" }}>
            <button type="button" onClick={() => removeRow("allergens", i)}>
              − {t("remove", "Remove")}
            </button>
          </Col>
        </Row>
      ))}
      <AddBtn
        type="button"
        onClick={() => pushRow("allergens", { key: "", value: {} as TranslatedLabel })}
      >
        + {t("addAllergen", "Add Allergen")}
      </AddBtn>

      {/* ============ ADDITIVES ============ */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
        <BlockTitle>{t("additives", "Additives")}</BlockTitle>
        <button type="button" onClick={() => clearAll("additives")} style={{ opacity: .8 }}>
          {t("clearAll", "Clear All")}
        </button>
      </div>

      <Row>
        <Col>
          <Label>{t("bulkKeys", "Keys (comma)")}</Label>
          <Input
            placeholder="1,2,3"
            value={bulkAdditives}
            onChange={(e) => setBulkAdditives(e.target.value)}
          />
        </Col>
        <Col style={{ gridColumn: "span 2" }}>
          <Label>{t("bulkValuesPreview", "Values (auto)")}</Label>
          <Input value={bulkAdditivePreview} readOnly />
        </Col>
        <Col style={{ alignItems: "flex-end" }}>
          <button type="button" onClick={() => addBulk("additives")}>
            + {t("add", "Add")}
          </button>
        </Col>
      </Row>

      {(structured.additives || []).map((a: any, i: number) => (
        <Row key={`add-${String(a?.key ?? "")}-${i}`}>
          <Col>
            <Label>{t("key", "Key")}</Label>
            <Input
              placeholder="1"
              value={a.key || ""}
              onChange={(e) => onKeyInput("additives", i, e.target.value)}
            />
          </Col>
          <Col style={{ gridColumn: "span 2" }}>
            <Label>{t("value", "Value")} ({lang})</Label>
            <Input
              value={getTLStrict(a.value, lang)}
              onChange={(e) => updateValue("additives", i, e.target.value)}
            />
          </Col>
          <Col style={{ alignItems: "flex-end" }}>
            <button type="button" onClick={() => removeRow("additives", i)}>
              − {t("remove", "Remove")}
            </button>
          </Col>
        </Row>
      ))}
      <AddBtn
        type="button"
        onClick={() => pushRow("additives", { key: "", value: {} as TranslatedLabel })}
      >
        + {t("addAdditive", "Add Additive")}
      </AddBtn>
    </>
  );
}
