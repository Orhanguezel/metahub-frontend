"use client";
import React from "react";
import { Row, Col, Label, Input, SmallRow, Small, Chips, Chip, CheckRow } from "../styled";

type Props = {
  t: (k: string, d?: string) => string;

  cuisinesStr: string; setCuisinesStr: (v: string) => void;
  applyCuisineCanon: () => void;

  tagsStr: string; setTagsStr: (v: string) => void;
  tagSuggestions: { key: string; label: string }[];
  selectedTags: string[]; toggleTag: (k: string) => void;

  servings?: number; setServings: (n?: number)=>void;
  calories?: number; setCalories: (n?: number)=>void;

  prepMinutes?: number; setPrepMinutes: (n?: number)=>void;
  cookMinutes?: number; setCookMinutes: (n?: number)=>void;
  totalMinutes?: number; setTotalMinutes: (n?: number)=>void;
  autoTotal: boolean; setAutoTotal: (v: boolean)=>void;

  isPublished: boolean; setIsPublished: (v: boolean)=>void;
  order: number; setOrder: (n: number)=>void;
  isActive: boolean; setIsActive: (v:boolean)=>void;

  effectiveFrom: string; setEffectiveFrom: (v: string)=>void;
  effectiveTo: string; setEffectiveTo: (v: string)=>void;
};

export default function NumbersAndFlags(p: Props) {
  const {
    t, cuisinesStr, setCuisinesStr, applyCuisineCanon,
    tagsStr, setTagsStr, tagSuggestions, selectedTags, toggleTag,
    servings, setServings, calories, setCalories,
    prepMinutes, setPrepMinutes, cookMinutes, setCookMinutes,
    totalMinutes, setTotalMinutes, autoTotal, setAutoTotal,
    isPublished, setIsPublished, order, setOrder, isActive, setIsActive,
    effectiveFrom, setEffectiveFrom, effectiveTo, setEffectiveTo
  } = p;

  return (
    <>
      <Row>
        <Col>
          <Label>{t("order", "Order")}</Label>
          <Input type="number" min={0} value={order} onChange={(e)=>setOrder(Number(e.target.value) || 0)} />
        </Col>
        <Col>
          <Label>{t("isActive", "Active?")}</Label>
          <CheckRow>
            <input type="checkbox" checked={isActive} onChange={(e)=>setIsActive(e.target.checked)} />
            <span>{isActive ? t("yes","Yes") : t("no","No")}</span>
          </CheckRow>
        </Col>
        <Col>
          <Label>{t("isPublished", "Published?")}</Label>
          <CheckRow>
            <input type="checkbox" checked={isPublished} onChange={(e)=>setIsPublished(e.target.checked)} />
            <span>{isPublished ? t("yes","Yes") : t("no","No")}</span>
          </CheckRow>
        </Col>
      </Row>

      <Row>
        <Col>
          <Label>{t("effectiveFrom", "Effective from")}</Label>
          <Input type="datetime-local" value={effectiveFrom} onChange={(e)=>setEffectiveFrom(e.target.value)} />
        </Col>
        <Col>
          <Label>{t("effectiveTo", "Effective to")}</Label>
          <Input type="datetime-local" value={effectiveTo} onChange={(e)=>setEffectiveTo(e.target.value)} />
        </Col>
      </Row>

      <Row>
        <Col>
          <Label>{t("cuisines", "Cuisines (comma)")}</Label>
          <Input value={cuisinesStr} onChange={(e)=>setCuisinesStr(e.target.value)} placeholder="turkish, italian" />
          <SmallRow>
            <Small type="button" onClick={applyCuisineCanon}>✨ {t("canonize", "Kanonik isimlere çevir")}</Small>
          </SmallRow>
        </Col>

        <Col>
          <Label>{t("tags", "Tags")}</Label>
          <Input value={tagsStr} onChange={(e)=>setTagsStr(e.target.value)} placeholder="quick, vegan" />
          <Chips role="list" aria-label={t("suggested_tags", "Önerilen etiketler")}>
            {tagSuggestions.map(s => (
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
          <Input type="number" min={0} value={totalMinutes ?? ""} onChange={(e)=>setTotalMinutes(e.target.value ? Number(e.target.value) : undefined)} disabled={autoTotal} />
          <SmallRow>
            <small>
              <input id="autototal" type="checkbox" checked={autoTotal} onChange={(e)=>setAutoTotal(e.target.checked)} />{" "}
              <label htmlFor="autototal">{t("auto_sum", "Hazırlık + Pişirme")}</label>
            </small>
          </SmallRow>
        </Col>
      </Row>
    </>
  );
}
