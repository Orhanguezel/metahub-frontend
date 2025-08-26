"use client";
import { BlockTitle, CheckRow, Col, Input, Label, Row, TextArea } from "./ItemForm.styles";
import type { SupportedLocale,TranslatedLabel } from "@/types/common";

type Props = {
  lang: SupportedLocale;
  isEdit: boolean;
  code: string; setCode: (v: string) => void;
  name: TranslatedLabel; onChangeName: (v: string) => void;
  description: TranslatedLabel; onChangeDescription: (v: string) => void;
  sku: string; setSku: (v: string) => void;
  barcode: string; setBarcode: (v: string) => void;
  taxCode: string; setTaxCode: (v: string) => void;
  isActive: boolean; setIsActive: (v: boolean) => void;
  isPublished: boolean; setIsPublished: (v: boolean) => void;
  t: (k: string, d?: string) => string;
  getTLStrict: (obj?: TranslatedLabel, l?: SupportedLocale) => string;
};

export default function ItemBasics({
  lang, isEdit, code, setCode, name, onChangeName, description, onChangeDescription,
  sku, setSku, barcode, setBarcode, taxCode, setTaxCode, isActive, setIsActive, isPublished, setIsPublished, t, getTLStrict
}: Props) {
  return (
    <>
      <BlockTitle>{t("basic","Basic")}</BlockTitle>
      <Row>
        <Col>
          <Label>{t("code","Code")}</Label>
          <Input value={code} onChange={(e)=>setCode(e.target.value)} disabled={isEdit}/>
        </Col>
        <Col><Label>{t("sku","SKU")}</Label><Input value={sku} onChange={(e)=>setSku(e.target.value)}/></Col>
        <Col><Label>{t("barcode","Barcode")}</Label><Input value={barcode} onChange={(e)=>setBarcode(e.target.value)}/></Col>
        <Col><Label>{t("taxCode","Tax Code")}</Label><Input value={taxCode} onChange={(e)=>setTaxCode(e.target.value)}/></Col>
      </Row>

      <Row>
        <Col>
          <Label>{t("item_name","Item Name")} ({lang})</Label>
          <Input value={getTLStrict(name, lang)} onChange={(e)=>onChangeName(e.target.value)} />
        </Col>
        <Col style={{gridColumn:"span 3"}}>
          <Label>{t("item_desc","Description")} ({lang})</Label>
          <TextArea rows={3} value={getTLStrict(description, lang)} onChange={(e)=>onChangeDescription(e.target.value)} />
        </Col>
      </Row>

      <Row>
        <Col>
          <Label>{t("isActive","Active?")}</Label>
          <CheckRow>
            <input type="checkbox" checked={isActive} onChange={(e)=>setIsActive(e.target.checked)} />
            <span>{isActive ? t("yes","Yes") : t("no","No")}</span>
          </CheckRow>
        </Col>
        <Col>
          <Label>{t("isPublished","Published?")}</Label>
          <CheckRow>
            <input type="checkbox" checked={isPublished} onChange={(e)=>setIsPublished(e.target.checked)} />
            <span>{isPublished ? t("yes","Yes") : t("no","No")}</span>
          </CheckRow>
        </Col>
      </Row>
    </>
  );
}
