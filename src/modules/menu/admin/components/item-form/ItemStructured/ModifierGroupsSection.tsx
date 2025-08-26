// src/modules/menu/admin/components/item-form/ItemStructured/ModifierGroupsSection.tsx
"use client";
import { AddBtn, BlockTitle, CheckRow, Col, Input, Label, Row, SubTitle, VarCard } from "../ItemForm.styles";
import type { SupportedLocale, TranslatedLabel } from "@/types/common";
import type { StructuredObj, TFunc, TLGetter } from "./types";
import { makeTL, setTL } from "@/i18n/getUILang";
import { PriceListEditor} from "@/modules/menu";

type Props = {
  lang: SupportedLocale;
  structured: StructuredObj;
  setStructured: (updater: (p: StructuredObj) => StructuredObj) => void;
  getTLStrict: TLGetter;
  t: TFunc;
};

export default function ModifierGroupsSection({
  lang, structured, setStructured, getTLStrict, t
}: Props) {
  const pushGroup = (row: any) =>
    setStructured((p) => ({ ...p, modifierGroups: [...(p.modifierGroups || []), row] }));

  const removeGroup = (gi: number) =>
    setStructured((p) => ({
      ...p,
      modifierGroups: (p.modifierGroups || []).filter((_: any, i: number) => i !== gi),
    }));

  const updateGroup = (gi: number, patch: any) =>
    setStructured((p) => ({
      ...p,
      modifierGroups: (p.modifierGroups || []).map((r: any, i: number) => (i === gi ? { ...r, ...patch } : r)),
    }));

  const addOption = (gi: number) =>
    setStructured((p) => ({
      ...p,
      modifierGroups: (p.modifierGroups || []).map((g: any, i: number) =>
        i === gi ? { ...g, options: [...(g.options || []), { code: "", name: makeTL(), prices: [] }] } : g
      ),
    }));

  const updateOption = (gi: number, oi: number, patch: any) =>
    setStructured((p) => ({
      ...p,
      modifierGroups: (p.modifierGroups || []).map((g: any, gi0: number) =>
        gi0 === gi ? { ...g, options: (g.options || []).map((o: any, oi0: number) => (oi0 === oi ? { ...o, ...patch } : o)) } : g
      ),
    }));

  const updateOptionTL = (gi: number, oi: number, value: string) =>
    setStructured((p) => ({
      ...p,
      modifierGroups: (p.modifierGroups || []).map((g: any, gi0: number) =>
        gi0 === gi
          ? { ...g, options: (g.options || []).map((o: any, oi0: number) => (oi0 === oi ? { ...o, name: setTL(o.name, lang, value) } : o)) }
          : g
      ),
    }));

  const removeOption = (gi: number, oi: number) =>
    setStructured((p) => ({
      ...p,
      modifierGroups: (p.modifierGroups || []).map((g: any, gi0: number) =>
        gi0 === gi ? { ...g, options: (g.options || []).filter((_: any, oi0: number) => oi0 !== oi) } : g
      ),
    }));

  return (
    <>
      <BlockTitle>{t("modifierGroups", "Modifier Groups")}</BlockTitle>

      {(structured.modifierGroups || []).map((g: any, gi: number) => (
        <VarCard key={`mg-${gi}`}>
          <Row>
            <Col>
              <Label>{t("code", "Code")}</Label>
              <Input value={g.code || ""} onChange={(e) => updateGroup(gi, { code: e.target.value })} />
            </Col>
            <Col>
              <Label>{t("name", "Name")} ({lang})</Label>
              <Input
                value={getTLStrict(g.name as TranslatedLabel, lang)}
                onChange={(e) => updateGroup(gi, { name: setTL(g.name, lang, e.target.value) })}
              />
            </Col>
            <Col>
              <Label>{t("order", "Order")}</Label>
              <Input type="number" value={g.order ?? ""} onChange={(e) => updateGroup(gi, { order: e.target.value })} />
            </Col>
            <Col style={{ alignItems: "flex-end" }}>
              <button type="button" onClick={() => removeGroup(gi)}>− {t("removeGroup", "Remove Group")}</button>
            </Col>
          </Row>

          <Row>
            <Col>
              <Label>{t("minSelect", "Min Select")}</Label>
              <Input type="number" value={g.minSelect ?? ""} onChange={(e) => updateGroup(gi, { minSelect: e.target.value })} />
            </Col>
            <Col>
              <Label>{t("maxSelect", "Max Select")}</Label>
              <Input type="number" value={g.maxSelect ?? ""} onChange={(e) => updateGroup(gi, { maxSelect: e.target.value })} />
            </Col>
            <Col>
              <Label>{t("required", "Required?")}</Label>
              <CheckRow>
                <input type="checkbox" checked={!!g.isRequired} onChange={(e) => updateGroup(gi, { isRequired: e.target.checked })} />
              </CheckRow>
            </Col>
          </Row>

          <SubTitle>{t("options", "Options")}</SubTitle>

          {(g.options || []).map((o: any, oi: number) => (
            <div key={`opt-${gi}-${oi}`} style={{ padding: 8, background: "#fafafa", borderRadius: 8, marginTop: 8 }}>
              <Row>
                <Col>
                  <Label>{t("code", "Code")}</Label>
                  <Input value={o.code || ""} onChange={(e) => updateOption(gi, oi, { code: e.target.value })} />
                </Col>
                <Col>
                  <Label>{t("name", "Name")} ({lang})</Label>
                  <Input value={getTLStrict(o.name as TranslatedLabel, lang)} onChange={(e) => updateOptionTL(gi, oi, e.target.value)} />
                </Col>
                <Col>
                  <Label>{t("order", "Order")}</Label>
                  <Input type="number" value={o.order ?? ""} onChange={(e) => updateOption(gi, oi, { order: e.target.value })} />
                </Col>
                <Col>
                  <Label>{t("default", "Default?")}</Label>
                  <CheckRow>
                    <input type="checkbox" checked={!!o.isDefault} onChange={(e) => updateOption(gi, oi, { isDefault: e.target.checked })} />
                  </CheckRow>
                </Col>
                <Col style={{ alignItems: "flex-end" }}>
                  <button type="button" onClick={() => removeOption(gi, oi)}>
                    − {t("remove", "Remove")}
                  </button>
                </Col>
              </Row>

              {/* ---- Prices for this option ---- */}
              <div style={{ marginTop: 6 }}>
                <Label style={{ fontWeight: 600 }}>{t("prices", "Prices")}</Label>
                <PriceListEditor
                  prices={o.prices}
                  onChange={(next) => updateOption(gi, oi, { prices: next })}
                  t={t}
                />
              </div>
            </div>
          ))}

          <AddBtn type="button" onClick={() => addOption(gi)}>
            + {t("addOption", "Add Option")}
          </AddBtn>
        </VarCard>
      ))}

      <AddBtn
        type="button"
        onClick={() =>
          pushGroup({ code: "", name: makeTL(), minSelect: 0, maxSelect: 0, isRequired: false, options: [] })
        }
      >
        + {t("addModifierGroup", "Add Modifier Group")}
      </AddBtn>
    </>
  );
}
