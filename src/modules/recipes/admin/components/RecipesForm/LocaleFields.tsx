"use client";
import React from "react";
import { Row, Col, Label, Input, TextArea } from "../styled";
import type { SupportedLocale } from "@/types/recipes/common";
import type { TL } from "@/modules/recipes/types";
import { setTL, getTLStrict } from "@/i18n/recipes/getUILang";

type Props = {
  t: (k: string, d?: string) => string;
  editLang: SupportedLocale;
  title: TL;
  setTitle: (v: TL) => void;
  description: TL;
  setDescription: (v: TL) => void;
};

export default function LocaleFields({ t, editLang, title, setTitle, description, setDescription }: Props) {
  const titleVal = getTLStrict(title as any, editLang);
  const descVal  = getTLStrict(description as any, editLang);

  return (
    <Row>
      <Col style={{ gridColumn: "span 2" }}>
        <Label>{t("titleField", "Title")} ({editLang})</Label>
        <Input
          value={titleVal}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTitle(setTL(title as any, editLang, e.target.value) as any)
          }
        />
      </Col>
      <Col style={{ gridColumn: "span 2" }}>
        <Label>{t("description", "Description")} ({editLang})</Label>
        <TextArea
          rows={2}
          value={descVal}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setDescription(setTL(description as any, editLang, e.target.value) as any)
          }
        />
      </Col>
    </Row>
  );
}
