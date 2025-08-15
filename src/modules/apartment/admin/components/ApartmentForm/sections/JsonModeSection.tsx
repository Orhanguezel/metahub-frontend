"use client";
import { Row, Label, Hint, Info } from "../FormUI";
import { JSONEditor } from "@/modules/scheduling";
import type { SupportedLocale } from "@/types/common";

export default function JsonModeSection({
  t, lang, fullJson, setFullJson, titlePreview,
}: {
  t: (k: string, d?: string) => string;
  lang: SupportedLocale;
  fullJson: any;
  setFullJson: (v: any) => void;
  titlePreview: string;
}) {
  return (
    <Row>
      <Label>{t("form.fullJson", "Apartment JSON")}</Label>
      <JSONEditor
        label={t("form.fullJson", "Apartment JSON")}
        value={fullJson}
        onChange={setFullJson}
        placeholder={`{
  "title":{"${lang}":""},
  "content":{"${lang}":""},
  "address":{"city":"","country":"TR"},
  "place":{"neighborhood":"<objectId>"},
  "contact":{"name":""},
  "customer":"<customerId>",
  "ops":{
    "employees":[],
    "services":[],
    "cleaningPlan":"<planId?>",
    "trashPlan":"<planId?>"
  }
}`}
      />
      {!!titlePreview && <Hint>{t("form.preview", "Preview")}: {titlePreview}</Hint>}
      <Info>{t("form.jsonNote","Images must still be uploaded below.")}</Info>
    </Row>
  );
}
