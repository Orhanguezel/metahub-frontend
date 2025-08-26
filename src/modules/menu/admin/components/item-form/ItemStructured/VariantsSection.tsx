// src/modules/menu/admin/components/item-form/ItemStructured/VariantsSection.tsx
"use client";
import { AddBtn, BlockTitle, CheckRow, Col, Input, Label, Row, VarCard } from "../ItemForm.styles";
import type { SupportedLocale, TranslatedLabel } from "@/types/common";
import type { StructuredObj, TFunc, TLGetter } from "./types";
import { makeTL } from "@/i18n/getUILang";
import { buildMenuTL, getLabelNested } from "@/modules/menu/constants/foodLabels";

type Props = {
  lang: SupportedLocale;
  structured: StructuredObj;
  setStructured: (updater: (p: StructuredObj) => StructuredObj) => void;
  getTLStrict: TLGetter;
  t: TFunc;
};

export default function VariantsSection({ lang, structured, setStructured, t }: Props) {
  const pushRow = (row: any) =>
    setStructured((p) => ({ ...p, variants: [...(p.variants || []), row] }));

  const removeRow = (idx: number) =>
    setStructured((p) => ({ ...p, variants: (p.variants || []).filter((_: any, i: number) => i !== idx) }));

  const updateRow = (idx: number, patch: any) =>
    setStructured((p) => ({ ...p, variants: (p.variants || []).map((r: any, i: number) => (i === idx ? { ...r, ...patch } : r)) }));

  /** code değişince isim & sizeLabel’ı tüm diller için sözlükten doldur */
  const onCodeChange = (idx: number, code: string) => {
    const nameTL: TranslatedLabel = buildMenuTL("variants.names", code);
    const sizeTL: TranslatedLabel = buildMenuTL("variants.sizes", code);
    updateRow(idx, { code, name: nameTL, sizeLabel: sizeTL });
  };

  return (
    <>
      <BlockTitle>{t("variants", "Variants")}</BlockTitle>

      {(structured.variants || []).map((v: any, i: number) => (
        <VarCard key={`var-${i}`}>
          <Row>
            <Col>
              <Label>{t("code", "Code")}</Label>
              <Input value={v.code || ""} onChange={(e) => onCodeChange(i, e.target.value)} />
            </Col>

            {/* İsim alanı artık sözlükten okunur — sadece önizleme */}
            <Col>
              <Label>{t("name", "Name")} ({lang})</Label>
              <Input value={getLabelNested("variants.names", String(v.code || ""), lang)} disabled />
            </Col>

            <Col>
              <Label>{t("order", "Order")}</Label>
              <Input type="number" value={v.order ?? ""} onChange={(e) => updateRow(i, { order: e.target.value })} />
            </Col>

            <Col>
              <Label>{t("default", "Default?")}</Label>
              <CheckRow>
                <input type="checkbox" checked={!!v.isDefault} onChange={(e) => updateRow(i, { isDefault: e.target.checked })} />
              </CheckRow>
            </Col>
          </Row>

          <Row>
            <Col><Label>SKU</Label>
              <Input value={v.sku || ""} onChange={(e) => updateRow(i, { sku: e.target.value })} />
            </Col>
            <Col>
              <Label>{t("barcode", "Barcode")}</Label>
              <Input value={v.barcode || ""} onChange={(e) => updateRow(i, { barcode: e.target.value })} />
            </Col>

            {/* sizeLabel da sözlükten — yalnızca önizleme */}
            <Col>
              <Label>{t("sizeLabel", "Size Label")} ({lang})</Label>
              <Input value={getLabelNested("variants.sizes", String(v.code || ""), lang)} disabled />
            </Col>

            <Col>
              <Label>{t("volumeMl", "Volume (ml)")}</Label>
              <Input type="number" value={v.volumeMl ?? ""} onChange={(e) => updateRow(i, { volumeMl: e.target.value })} />
            </Col>
          </Row>

          <Row>
            <Col>
              <Label>{t("netWeightGr", "Net Weight (gr)")}</Label>
              <Input type="number" value={v.netWeightGr ?? ""} onChange={(e) => updateRow(i, { netWeightGr: e.target.value })} />
            </Col>
            <Col><Label>PriceListItem</Label>
              <Input value={v.priceListItem || ""} onChange={(e) => updateRow(i, { priceListItem: e.target.value })} />
            </Col>
            <Col><Label>DepositPriceListItem</Label>
              <Input value={v.depositPriceListItem || ""} onChange={(e) => updateRow(i, { depositPriceListItem: e.target.value })} />
            </Col>
            <Col style={{ alignItems: "flex-end" }}>
              <button type="button" onClick={() => removeRow(i)}>− {t("remove", "Remove")}</button>
            </Col>
          </Row>

          <div style={{ marginTop: 8 }}>
            <Label style={{ fontWeight: 600 }}>{t("prices", "Prices")}</Label>
            {/* PriceListEditor aynı kaldı, fakat etiketleri i18n'den alacak (aşağıda güncellendi) */}
          </div>
        </VarCard>
      ))}

      <AddBtn
        type="button"
        onClick={() => pushRow({
          code: "",
          name: makeTL(),          // backend zorunluysa boş TL gönderir, code değişince otomatik set edilir
          sizeLabel: makeTL(),
          order: (structured.variants?.length || 0) + 1,
          isDefault: false,
          prices: [],
        })}
      >
        + {t("addVariant", "Add Variant")}
      </AddBtn>
    </>
  );
}
