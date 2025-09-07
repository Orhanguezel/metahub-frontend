"use client";
import React from "react";
import { Row, Col, Label, Input, Small, SmallRow, Divider, Primary, Secondary } from "../styled";
import type { SupportedLocale } from "@/types/recipes/common";
import type { TL } from "@/modules/recipes/types";
import { getTLStrict, setTL } from "@/i18n/recipes/getUILang";

type Ingredient = {
  name: TL;
  amount?: TL;
  order?: number;
};

type Props = {
  t: (k: string, d?: string) => string;
  editLang: SupportedLocale;
  items: Ingredient[];
  setItems: (v: Ingredient[]) => void;
};

const normOrders = (list: Ingredient[]) =>
  list.map((it, i) => ({ ...it, order: i }));

export default function IngredientsEditor({ t, editLang, items, setItems }: Props) {
  const add = () => {
    const next: Ingredient = { name: {}, amount: {}, order: items.length };
    setItems(normOrders([...(items || []), next]));
  };

  const remove = (idx: number) => {
    const next = [...items];
    next.splice(idx, 1);
    setItems(normOrders(next));
  };

  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    const [tmp] = next.splice(idx, 1);
    next.splice(j, 0, tmp);
    setItems(normOrders(next));
  };

  const setName = (idx: number, val: string) => {
    const next = [...items];
    next[idx] = { ...next[idx], name: setTL(next[idx].name as any, editLang, val) as any };
    setItems(next);
  };

  const setAmount = (idx: number, val: string) => {
    const next = [...items];
    next[idx] = { ...next[idx], amount: setTL(next[idx].amount as any, editLang, val) as any };
    setItems(next);
  };

  return (
    <>
      <Divider />
      <Row><Col><Label>{t("ingredients", "Ingredients")}</Label></Col></Row>

      {(items || []).map((ing, idx) => {
        const nameVal = getTLStrict(ing.name as any, editLang);
        const amountVal = getTLStrict((ing.amount || {}) as any, editLang);
        return (
          <Row key={idx}>
            <Col style={{ gridColumn: "span 2" }}>
              <Label>{t("ingredient_name", "Name")} ({editLang})</Label>
              <Input value={nameVal} onChange={(e)=>setName(idx, e.target.value)} placeholder={t("ingredient_name_ph","ör: domates")} />
            </Col>
            <Col>
              <Label>{t("ingredient_amount", "Amount")} ({editLang})</Label>
              <Input value={amountVal} onChange={(e)=>setAmount(idx, e.target.value)} placeholder={t("ingredient_amount_ph","ör: 2 adet")} />
            </Col>
            <Col>
              <Label>{t("order", "Order")}</Label>
              <div style={{ display:"flex", gap:8 }}>
                <Input type="number" min={0} value={ing.order ?? idx} onChange={(e)=>{
                  // serbest order düzenleme: sadece değeri yaz, sonra normalize et
                  const v = Number(e.target.value);
                  const next = [...items];
                  next[idx] = { ...next[idx], order: Number.isFinite(v) ? v : idx };
                  // yeniden sıralama: mevcut item'i hedef order'a taşı
                  const sorted = [...next].sort((a,b)=>(a.order ?? 0)-(b.order ?? 0));
                  setItems(normOrders(sorted));
                }} />
                <Small type="button" onClick={()=>move(idx,-1)}>↑</Small>
                <Small type="button" onClick={()=>move(idx, 1)}>↓</Small>
                <Small type="button" onClick={()=>remove(idx)}>{t("delete","Delete")}</Small>
              </div>
            </Col>
          </Row>
        );
      })}

      <SmallRow>
        <Primary type="button" onClick={add}>+ {t("add_ingredient","Malzeme ekle")}</Primary>
        {!!items?.length && <Secondary type="button" onClick={()=>setItems(normOrders(items))}>{t("normalize_order","Sırayı düzelt")}</Secondary>}
      </SmallRow>
    </>
  );
}
