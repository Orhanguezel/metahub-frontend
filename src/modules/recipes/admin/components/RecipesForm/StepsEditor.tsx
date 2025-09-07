"use client";
import React from "react";
import { Row, Col, Label, TextArea, Small, SmallRow, Divider, Primary, Secondary } from "../styled";
import type { SupportedLocale } from "@/types/recipes/common";
import type { TL } from "@/modules/recipes/types";
import { getTLStrict, setTL } from "@/i18n/recipes/getUILang";

type Step = {
  order?: number;
  text: TL;
};

type Props = {
  t: (k: string, d?: string) => string;
  editLang: SupportedLocale;
  items: Step[];
  setItems: (v: Step[]) => void;
};

const normOrdersSteps = (list: Step[]) =>
  list.map((it, i) => ({ ...it, order: i + 1 })); // örnek JSON steps 1'den başlıyor

export default function StepsEditor({ t, editLang, items, setItems }: Props) {
  const add = () => {
    const next: Step = { text: {}, order: (items?.length || 0) + 1 };
    setItems(normOrdersSteps([...(items || []), next]));
  };

  const remove = (idx: number) => {
    const next = [...items];
    next.splice(idx, 1);
    setItems(normOrdersSteps(next));
  };

  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    const [tmp] = next.splice(idx, 1);
    next.splice(j, 0, tmp);
    setItems(normOrdersSteps(next));
  };

  const setText = (idx: number, val: string) => {
    const next = [...items];
    next[idx] = { ...next[idx], text: setTL(next[idx].text as any, editLang, val) as any };
    setItems(next);
  };

  return (
    <>
      <Divider />
      <Row><Col><Label>{t("steps", "Steps")}</Label></Col></Row>

      {(items || []).map((stp, idx) => {
        const textVal = getTLStrict(stp.text as any, editLang);
        return (
          <Row key={idx}>
            <Col style={{ gridColumn: "span 3" }}>
              <Label>{t("step_text", "Step text")} ({editLang})</Label>
              <TextArea rows={2} value={textVal} onChange={(e)=>setText(idx, e.target.value)} placeholder={t("step_text_ph","ör: Sebzeleri doğrayın…")} />
            </Col>
            <Col>
              <Label>{t("order","Order")}</Label>
              <div style={{ display:"flex", gap:8 }}>
                <InputLike
                  type="number"
                  min={1}
                  value={stp.order ?? idx+1}
                  onChange={(e)=>{
                    const v = Number(e.target.value);
                    const next = [...items];
                    next[idx] = { ...next[idx], order: Number.isFinite(v) ? v : (idx+1) };
                    const sorted = [...next].sort((a,b)=>(a.order ?? 0)-(b.order ?? 0));
                    setItems(normOrdersSteps(sorted));
                  }}
                />
                <Small type="button" onClick={()=>move(idx,-1)}>↑</Small>
                <Small type="button" onClick={()=>move(idx, 1)}>↓</Small>
                <Small type="button" onClick={()=>remove(idx)}>{t("delete","Delete")}</Small>
              </div>
            </Col>
          </Row>
        );
      })}

      <SmallRow>
        <Primary type="button" onClick={add}>+ {t("add_step","Adım ekle")}</Primary>
        {!!items?.length && <Secondary type="button" onClick={()=>setItems(normOrdersSteps(items))}>{t("normalize_order","Sırayı düzelt")}</Secondary>}
      </SmallRow>
    </>
  );
}

/** küçük yardımcı input (styled'dan sade bir input kullanımı için) */
function InputLike(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ padding:"10px 12px", borderRadius:8, border:"1px solid var(--border, rgba(255,255,255,.1))", width:88 }} />;
}
