"use client";
import { Row, Label, Input, Textarea, Hint } from "../FormUI";
import type { SupportedLocale } from "@/types/common";

export default function TitleContentSection({
  t, lang, titleSingle, setTitleSingle, contentSingle, setContentSingle, titlePreview,
}: {
  t: (k: string, d?: string) => string;
  lang: SupportedLocale;
  titleSingle: string;
  setTitleSingle: (v: string) => void;
  contentSingle: string;
  setContentSingle: (v: string) => void;
  titlePreview: string;
}) {
  return (
    <>
      <Row>
        <Label>{t("form.titleSimple", "Title")} ({lang})</Label>
        <Input value={titleSingle} onChange={(e) => setTitleSingle(e.target.value)} placeholder={t("form.titlePlaceholder", "Title")} />
        {!!titlePreview && <Hint>{t("form.preview","Preview")}: {titlePreview}</Hint>}
      </Row>

      <Row>
        <Label>{t("form.contentSimple", "Content")} ({lang})</Label>
        <Textarea rows={4} value={contentSingle} onChange={(e) => setContentSingle(e.target.value)} placeholder={t("form.contentPlaceholder", "Description")} />
      </Row>
    </>
  );
}
